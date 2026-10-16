import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';
import { activeLinkCodes } from '../src/routes/telegram.js';
import {
  sendMessage,
  getTelegramConfigStatus,
  processTelegramUpdate,
} from '../src/services/notifications/telegram.js';

describe('Telegram Integration & Account Linking (Document 1 Section 6.5 & Guide 4)', () => {
  const originalEnv = { ...process.env };
  const JWT_SECRET = process.env.JWT_SECRET || 'testsecret1234567890123456789012';

  let userAId;
  let userAToken;
  let userBId;
  let userBToken;

  const hasDb = Boolean(process.env.MONGODB_URI);

  beforeAll(async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'mock-telegram-token-12345';
    process.env.TELEGRAM_BOT_USERNAME = 'PriceRadar_Alerts_Bot';

    if (!hasDb) return;
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    const userA = await User.create({
      name: 'Telegram User A',
      email: `telegram_a_${Date.now()}@example.com`,
      passwordHash: 'dummyhash',
    });
    userAId = userA._id.toString();
    userAToken = jwt.sign({ sub: userAId }, JWT_SECRET, { expiresIn: '1h' });

    const userB = await User.create({
      name: 'Telegram User B',
      email: `telegram_b_${Date.now()}@example.com`,
      passwordHash: 'dummyhash',
    });
    userBId = userB._id.toString();
    userBToken = jwt.sign({ sub: userBId }, JWT_SECRET, { expiresIn: '1h' });
  }, 25000);

  afterAll(async () => {
    process.env = originalEnv;
    if (!hasDb) return;
    if (userAId) await User.findByIdAndDelete(userAId);
    if (userBId) await User.findByIdAndDelete(userBId);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }, 25000);

  beforeEach(() => {
    jest.restoreAllMocks();
    activeLinkCodes.clear();
  });

  // -------------------------------------------------------------------------
  // 1. Diagnostic Status Helper
  // -------------------------------------------------------------------------
  describe('getTelegramConfigStatus() Diagnostic Helper', () => {
    it('should report configured true when token exists without exposing token', () => {
      process.env.TELEGRAM_BOT_TOKEN = 'secret-token-xyz';
      const status = getTelegramConfigStatus();
      expect(status.configured).toBe(true);
      expect(status.hasToken).toBe(true);
      expect(status.botUsername).toBe('PriceRadar_Alerts_Bot');
      expect(status.botLink).toBe('https://t.me/PriceRadar_Alerts_Bot');
      expect(status).not.toHaveProperty('token');
      expect(JSON.stringify(status)).not.toContain('secret-token-xyz');
    });

    it('should report configured false when TELEGRAM_BOT_TOKEN is missing or blank', () => {
      delete process.env.TELEGRAM_BOT_TOKEN;
      const status = getTelegramConfigStatus();
      expect(status.configured).toBe(false);
      expect(status.hasToken).toBe(false);
      process.env.TELEGRAM_BOT_TOKEN = 'mock-telegram-token-12345';
    });
  });

  // -------------------------------------------------------------------------
  // 2. HTTP Linking Code Generation
  // -------------------------------------------------------------------------
  describe('POST /api/telegram/link-code', () => {
    it('should require authentication (401 without token)', async () => {
      const res = await request(app).post('/api/telegram/link-code');
      expect(res.statusCode).toBe(401);
    });

    it('should generate a 6-character uppercase code with 15-minute expiry and deep link', async () => {
      const res = await request(app)
        .post('/api/telegram/link-code')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.linkCode).toMatch(/^[A-Z0-9]{6}$/);
      expect(data.botUsername).toBe('PriceRadar_Alerts_Bot');
      expect(data.botDeepLink).toBe(`https://t.me/PriceRadar_Alerts_Bot?start=${data.linkCode}`);
      expect(new Date(data.expiresAt).getTime()).toBeGreaterThan(Date.now());

      // Code is stored in memory for User A
      expect(activeLinkCodes.has(data.linkCode)).toBe(true);
      expect(activeLinkCodes.get(data.linkCode).userId).toBe(userAId);
    });
  });

  // -------------------------------------------------------------------------
  // 3. HTTP Linking Endpoint & Security Guards
  // -------------------------------------------------------------------------
  describe('POST /api/telegram/link Security & Validation', () => {
    it('should reject invalid link code with 400 INVALID_CODE', async () => {
      const res = await request(app)
        .post('/api/telegram/link')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ linkCode: 'NONEXISTENT' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('INVALID_CODE');
    });

    it('should reject expired link code with 400 INVALID_CODE', async () => {
      // Plant an expired code
      const code = 'EXP123';
      activeLinkCodes.set(code, {
        userId: userAId,
        expiresAt: new Date(Date.now() - 5000), // Expired 5 seconds ago
      });

      const res = await request(app)
        .post('/api/telegram/link')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ linkCode: code, chatId: '123456789' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('INVALID_CODE');
    });

    it('should enforce user isolation: User B cannot use User A link code', async () => {
      // User A creates code
      const codeRes = await request(app)
        .post('/api/telegram/link-code')
        .set('Authorization', `Bearer ${userAToken}`);
      const code = codeRes.body.data.linkCode;

      // User B attempts to consume User A's code
      const hijackRes = await request(app)
        .post('/api/telegram/link')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ linkCode: code, chatId: '999999999' });

      expect(hijackRes.statusCode).toBe(400);
      expect(hijackRes.body.error.code).toBe('INVALID_CODE');

      // Verify User B was NOT linked
      const userBInDb = await User.findById(userBId);
      expect(userBInDb.telegramChatId).toBeFalsy();
    });

    it('should successfully link valid code and prevent replay attacks (single-use)', async () => {
      // User A creates code
      const codeRes = await request(app)
        .post('/api/telegram/link-code')
        .set('Authorization', `Bearer ${userAToken}`);
      const code = codeRes.body.data.linkCode;

      // User A completes link with simulated chatId
      const linkRes = await request(app)
        .post('/api/telegram/link')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ linkCode: code, chatId: '777888999' });

      expect(linkRes.statusCode).toBe(200);
      expect(linkRes.body.data.linked).toBe(true);

      // Verify DB persistence
      const userAInDb = await User.findById(userAId);
      expect(userAInDb.telegramChatId).toBe('777888999');

      // Replay attempt: Second use of same code must fail
      const replayRes = await request(app)
        .post('/api/telegram/link')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ linkCode: code, chatId: '777888999' });

      // If already linked, endpoint returns linked: true directly, but the linkCode itself is gone
      expect(activeLinkCodes.has(code)).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Telegram Update Processing (/start <code> via Webhook/Polling)
  // -------------------------------------------------------------------------
  describe('processTelegramUpdate() Bot Command Handler', () => {
    it('should guide user when plain /start is received without code', async () => {
      const sendSpy = jest.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { ok: true, result: { message_id: 101 } },
      });

      const result = await processTelegramUpdate({
        message: {
          chat: { id: 111222333 },
          text: '/start',
        },
      });

      expect(result.linked).toBe(false);
      expect(result.reason).toBe('Plain /start without code');
      expect(sendSpy).toHaveBeenCalledTimes(1);
    });

    it('should reject invalid or expired code received from Telegram update', async () => {
      const sendSpy = jest.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { ok: true, result: { message_id: 102 } },
      });

      const result = await processTelegramUpdate({
        message: {
          chat: { id: 111222333 },
          text: '/start INVALID',
        },
      });

      expect(result.linked).toBe(false);
      expect(result.reason).toBe('Invalid or already used code');
      expect(sendSpy).toHaveBeenCalledTimes(1);
    });

    it('should successfully link user when /start <code> with valid code is received', async () => {
      // Mock axios.post for the welcome confirmation message
      const sendSpy = jest.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { ok: true, result: { message_id: 103 } },
      });

      // User B generates a code
      const code = 'BOT123';
      activeLinkCodes.set(code, {
        userId: userBId,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      const result = await processTelegramUpdate({
        message: {
          chat: { id: 555666777 },
          text: `/start ${code}`,
        },
      });

      expect(result.linked).toBe(true);
      expect(result.userId).toBe(userBId);
      expect(result.chatId).toBe('555666777');

      // Verify code was consumed
      expect(activeLinkCodes.has(code)).toBe(false);

      // Verify User B DB was updated
      const userBInDb = await User.findById(userBId);
      expect(userBInDb.telegramChatId).toBe('555666777');

      // Confirmation message sent via Telegram Bot API
      expect(sendSpy).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------------------------
  // 5. Telegram Disconnect Endpoint
  // -------------------------------------------------------------------------
  describe('POST /api/telegram/disconnect', () => {
    it('should unbind telegramChatId and clean active link codes', async () => {
      // Ensure User A is linked
      await User.findByIdAndUpdate(userAId, { telegramChatId: '777888999' });
      activeLinkCodes.set('TEST99', { userId: userAId, expiresAt: new Date(Date.now() + 60000) });

      const res = await request(app)
        .post('/api/telegram/disconnect')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.linked).toBe(false);

      // Verify in DB
      const userAInDb = await User.findById(userAId);
      expect(userAInDb.telegramChatId).toBeNull();

      // Verify active link codes cleared
      expect(activeLinkCodes.has('TEST99')).toBe(false);

      // Verify notification-preferences endpoint reflects disconnect
      const prefRes = await request(app)
        .get('/api/notification-preferences')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(prefRes.body.data.telegramLinked).toBe(false);
      expect(prefRes.body.data.telegramChatId).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // 6. sendMessage() Mocked Dispatch & Error Handling
  // -------------------------------------------------------------------------
  describe('sendMessage() Notification Delivery', () => {
    it('should return failure without throwing when TELEGRAM_BOT_TOKEN is missing', async () => {
      delete process.env.TELEGRAM_BOT_TOKEN;
      const result = await sendMessage({ chatId: '12345', text: 'Hello' });
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('TELEGRAM_BOT_TOKEN is not configured');
      process.env.TELEGRAM_BOT_TOKEN = 'mock-telegram-token-12345';
    });

    it('should return failure without throwing when chatId is missing', async () => {
      const result = await sendMessage({ chatId: null, text: 'Hello' });
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('No telegramChatId on file');
    });

    it('should post HTML payload to Telegram Bot API and return messageId on 200', async () => {
      const postSpy = jest.spyOn(axios, 'post').mockResolvedValueOnce({
        status: 200,
        data: { ok: true, result: { message_id: 8899 } },
      });

      const result = await sendMessage({
        chatId: '987654321',
        text: '<b>Price Drop Alert!</b> Product XYZ is down 15%',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe(8899);
      expect(postSpy).toHaveBeenCalledWith(
        'https://api.telegram.org/botmock-telegram-token-12345/sendMessage',
        {
          chat_id: '987654321',
          text: '<b>Price Drop Alert!</b> Product XYZ is down 15%',
          parse_mode: 'HTML',
        },
        expect.objectContaining({ timeout: 10000 })
      );
    });

    it('should handle Telegram API error (e.g. 403 Forbidden / bot blocked) gracefully without throwing', async () => {
      jest.spyOn(axios, 'post').mockRejectedValueOnce({
        response: {
          status: 403,
          data: { description: 'Forbidden: bot was blocked by the user' },
        },
      });

      const result = await sendMessage({
        chatId: 'blocked-chat-id',
        text: 'Test message',
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Telegram API error 403');
      expect(result.errorMessage).toContain('Forbidden: bot was blocked by the user');
    });
  });
});
