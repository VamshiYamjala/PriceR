import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';

describe('Telegram Account Linking API (Document 1 Section 6.5)', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'testsecret1234567890123456789012';
  let userId;
  let userToken;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    const user = await User.create({
      name: 'Telegram Tester',
      email: `telegram_${Date.now()}@example.com`,
      passwordHash: 'dummyhash',
    });
    userId = user._id.toString();
    userToken = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    if (userId) {
      await User.findByIdAndDelete(userId);
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('POST /api/telegram/link-code should require auth and return 6-character code', async () => {
    const res = await request(app)
      .post('/api/telegram/link-code')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('linkCode');
    expect(res.body.data.linkCode.length).toBe(6);
    expect(res.body.data).toHaveProperty('botUsername');
    expect(res.body.data).toHaveProperty('expiresAt');
  });

  it('POST /api/telegram/link with invalid linkCode should return 400 INVALID_CODE', async () => {
    const res = await request(app)
      .post('/api/telegram/link')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ linkCode: 'INVALID' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('INVALID_CODE');
  });

  it('POST /api/telegram/link with valid linkCode and simulated chatId should complete the link', async () => {
    // 1. Generate code
    const codeRes = await request(app)
      .post('/api/telegram/link-code')
      .set('Authorization', `Bearer ${userToken}`);
    const code = codeRes.body.data.linkCode;

    // 2. Complete link with simulated chatId (simulating user sending /start <code> to bot)
    const linkRes = await request(app)
      .post('/api/telegram/link')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ linkCode: code, chatId: '987654321' });

    expect(linkRes.statusCode).toBe(200);
    expect(linkRes.body.success).toBe(true);
    expect(linkRes.body.data).toEqual({ linked: true });

    // 3. Confirm in user notification preferences
    const prefRes = await request(app)
      .get('/api/notification-preferences')
      .set('Authorization', `Bearer ${userToken}`);

    expect(prefRes.statusCode).toBe(200);
    expect(prefRes.body.data.telegramLinked).toBe(true);
    expect(prefRes.body.data.telegramChatId).toBe('987654321');
  });
});
