// server/tests/registrationOtpFlow.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import crypto from 'crypto';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import OtpChallenge from '../src/models/OtpChallenge.js';
import emailService from '../src/services/notifications/email.js';

describe('Registration Email OTP End-to-End Regression Suite', () => {
  const hasDb = Boolean(process.env.MONGODB_URI);
  const createdUserIds = [];
  const testEmails = [];

  beforeAll(async () => {
    if (!hasDb) return;
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
  });

  afterAll(async () => {
    if (!hasDb) return;
    for (const id of createdUserIds) {
      try {
        await User.findByIdAndDelete(id);
      } catch (_) {}
    }
    for (const email of testEmails) {
      try {
        await OtpChallenge.deleteMany({ email });
        await User.deleteMany({ email });
      } catch (_) {}
    }
    await disconnectDB();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // 1. Success Flow
  // -------------------------------------------------------------------------
  it('1. Registration email success returns 200, saves challenge, and provides cooldown', async () => {
    const testEmail = `otp_success_${Date.now()}@example.com`;
    testEmails.push(testEmail);

    const emailSpy = jest.spyOn(emailService, 'sendOtpEmail').mockResolvedValueOnce({
      success: true,
      providerMessageId: '<mock-brevo-msg-id-123@smtp-relay.brevo.com>',
      recipient: testEmail,
    });

    const res = await request(app)
      .post('/api/auth/register/initiate')
      .send({
        name: 'Success User',
        email: testEmail,
        password: 'StrongPassword123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testEmail);
    expect(res.body.data.resendCooldownSeconds).toBe(60);
    expect(emailSpy).toHaveBeenCalledTimes(1);

    // Verify challenge exists in DB
    const challenge = await OtpChallenge.findOne({ email: testEmail, purpose: 'register' });
    expect(challenge).not.toBeNull();
    expect(challenge.otpHash).toBeDefined();
    expect(challenge.attempts).toBe(0);
  });

  // -------------------------------------------------------------------------
  // 2. Missing Brevo Configuration
  // -------------------------------------------------------------------------
  it('2. Missing Brevo configuration returns 503 and removes orphaned challenge', async () => {
    const testEmail = `otp_noconfig_${Date.now()}@example.com`;
    testEmails.push(testEmail);

    jest.spyOn(emailService, 'sendOtpEmail').mockResolvedValueOnce({
      success: false,
      recipient: testEmail,
      errorMessage: 'BREVO_API_KEY or EMAIL_FROM is not configured in server/.env.',
    });

    const res = await request(app)
      .post('/api/auth/register/initiate')
      .send({
        name: 'NoConfig User',
        email: testEmail,
        password: 'StrongPassword123!',
      });

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_DELIVERY_FAILED');
    expect(res.body.error.message).toContain('Unable to send verification email');

    // Crucial check: verify challenge was deleted so user is NOT trapped
    const challenge = await OtpChallenge.findOne({ email: testEmail, purpose: 'register' });
    expect(challenge).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 3. Brevo HTTP 401 Authentication Failure
  // -------------------------------------------------------------------------
  it('3. Brevo HTTP 401 returns 503 without leaking provider secrets or internal details', async () => {
    const testEmail = `otp_authfail_${Date.now()}@example.com`;
    testEmails.push(testEmail);

    jest.spyOn(emailService, 'sendOtpEmail').mockResolvedValueOnce({
      success: false,
      recipient: testEmail,
      statusCode: 401,
      errorMessage: 'Brevo API error 401: Key not found in account',
    });

    const res = await request(app)
      .post('/api/auth/register/initiate')
      .send({
        name: 'AuthFail User',
        email: testEmail,
        password: 'StrongPassword123!',
      });

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_DELIVERY_FAILED');
    // Ensure raw internal error is NOT leaked in client response
    expect(res.body.error.message).not.toContain('Key not found');
    expect(res.body.error.message).not.toContain('401');

    const challenge = await OtpChallenge.findOne({ email: testEmail, purpose: 'register' });
    expect(challenge).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 4. Unverified or Rejected Sender
  // -------------------------------------------------------------------------
  it('4. Unverified sender rejection returns 503 safely', async () => {
    const testEmail = `otp_unverified_${Date.now()}@example.com`;
    testEmails.push(testEmail);

    jest.spyOn(emailService, 'sendOtpEmail').mockResolvedValueOnce({
      success: false,
      recipient: testEmail,
      statusCode: 400,
      errorMessage: 'Brevo API error 400: sender email is not valid or not whitelisted',
    });

    const res = await request(app)
      .post('/api/auth/register/initiate')
      .send({
        name: 'SenderReject User',
        email: testEmail,
        password: 'StrongPassword123!',
      });

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_DELIVERY_FAILED');
    expect(res.body.error.message).toContain('Unable to send verification email');

    const challenge = await OtpChallenge.findOne({ email: testEmail, purpose: 'register' });
    expect(challenge).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 5. Brevo Throttling and Network Timeouts
  // -------------------------------------------------------------------------
  it('5. Network timeouts do not report false success', async () => {
    const testEmail = `otp_timeout_${Date.now()}@example.com`;
    testEmails.push(testEmail);

    jest.spyOn(emailService, 'sendOtpEmail').mockResolvedValueOnce({
      success: false,
      recipient: testEmail,
      errorMessage: 'Brevo API request failed: ETIMEDOUT: Connection timed out',
    });

    const res = await request(app)
      .post('/api/auth/register/initiate')
      .send({
        name: 'Timeout User',
        email: testEmail,
        password: 'StrongPassword123!',
      });

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_DELIVERY_FAILED');

    const challenge = await OtpChallenge.findOne({ email: testEmail, purpose: 'register' });
    expect(challenge).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 6 & 7. Resend Flow & Challenge Recovery
  // -------------------------------------------------------------------------
  it('6 & 7. Resend flow does not claim success on failure and preserves existing valid challenge', async () => {
    const testEmail = `otp_resend_${Date.now()}@example.com`;
    testEmails.push(testEmail);

    // First initiate with success
    const originalOtp = '112233';
    const originalHash = crypto.createHash('sha256').update(originalOtp).digest('hex');

    await OtpChallenge.create({
      name: 'Resend Tester',
      email: testEmail,
      passwordHash: 'mock-hash',
      otpHash: originalHash,
      purpose: 'register',
      attempts: 0,
      resendAvailableAt: new Date(Date.now() - 5000), // Cooldown elapsed
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Mock sendOtpEmail to FAIL on resend
    jest.spyOn(emailService, 'sendOtpEmail').mockResolvedValueOnce({
      success: false,
      recipient: testEmail,
      errorMessage: 'Brevo API error 429: Rate limit exceeded',
    });

    const res = await request(app)
      .post('/api/auth/register/resend')
      .send({ email: testEmail });

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_DELIVERY_FAILED');

    // Verify existing challenge was NOT overwritten or deleted
    const preservedChallenge = await OtpChallenge.findOne({ email: testEmail, purpose: 'register' });
    expect(preservedChallenge).not.toBeNull();
    expect(preservedChallenge.otpHash).toBe(originalHash);
  });

  // -------------------------------------------------------------------------
  // 8. OTP Expiration and Verification Attempt Limits
  // -------------------------------------------------------------------------
  it('8. Enforces 5-attempt limit and rejects expired OTPs', async () => {
    const testEmail = `otp_limit_${Date.now()}@example.com`;
    testEmails.push(testEmail);

    const correctOtp = '654321';
    const correctHash = crypto.createHash('sha256').update(correctOtp).digest('hex');

    const challenge = await OtpChallenge.create({
      name: 'Attempt Tester',
      email: testEmail,
      passwordHash: 'mock-password-hash',
      otpHash: correctHash,
      purpose: 'register',
      attempts: 4, // 1 attempt remaining
      resendAvailableAt: new Date(Date.now() + 60000),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // 5th attempt with wrong OTP
    const res5 = await request(app)
      .post('/api/auth/register/verify')
      .send({ email: testEmail, otp: '000000' });

    expect(res5.status).toBe(400);
    expect(res5.body.error.code).toBe('OTP_INVALID');
    expect(res5.body.error.message).toContain('0 attempt(s) remaining');

    // 6th attempt should be blocked with 429 TOO_MANY_ATTEMPTS
    const res6 = await request(app)
      .post('/api/auth/register/verify')
      .send({ email: testEmail, otp: correctOtp });

    expect(res6.status).toBe(429);
    expect(res6.body.error.code).toBe('TOO_MANY_ATTEMPTS');

    // Expired OTP test
    const expiredEmail = `otp_expired_${Date.now()}@example.com`;
    testEmails.push(expiredEmail);
    await OtpChallenge.create({
      name: 'Expired Tester',
      email: expiredEmail,
      passwordHash: 'mock-hash',
      otpHash: correctHash,
      purpose: 'register',
      attempts: 0,
      expiresAt: new Date(Date.now() - 5000), // Expired 5 seconds ago
    });

    const resExpired = await request(app)
      .post('/api/auth/register/verify')
      .send({ email: expiredEmail, otp: correctOtp });

    expect(resExpired.status).toBe(400);
    expect(resExpired.body.error.code).toBe('OTP_EXPIRED');
  });

  // -------------------------------------------------------------------------
  // 9. Successful OTP Verification creates user and returns JWT
  // -------------------------------------------------------------------------
  it('9. Successful OTP verification creates user, signs JWT, and cleans up challenge', async () => {
    const testEmail = `otp_verify_${Date.now()}@example.com`;
    testEmails.push(testEmail);

    const validOtp = '789123';
    const otpHash = crypto.createHash('sha256').update(validOtp).digest('hex');

    await OtpChallenge.create({
      name: 'Verified Shopper',
      email: testEmail,
      passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // valid bcrypt hash
      otpHash,
      purpose: 'register',
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const res = await request(app)
      .post('/api/auth/register/verify')
      .send({ email: testEmail, otp: validOtp });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.user.name).toBe('Verified Shopper');

    createdUserIds.push(res.body.data.user.id);

    // Verify challenge was cleaned up
    const challengeAfter = await OtpChallenge.findOne({ email: testEmail });
    expect(challengeAfter).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 11. Security Check: Zero Plaintext OTP or Secrets in Logs
  // -------------------------------------------------------------------------
  it('11. Security Check: Never logs plaintext OTP, password, or secret values', async () => {
    const testEmail = `otp_sec_${Date.now()}@example.com`;
    testEmails.push(testEmail);

    const capturedLogs = [];
    const logSpy = jest.spyOn(console, 'log').mockImplementation((...args) => {
      capturedLogs.push(args.join(' '));
    });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation((...args) => {
      capturedLogs.push(args.join(' '));
    });

    jest.spyOn(emailService, 'sendOtpEmail').mockResolvedValueOnce({
      success: true,
      providerMessageId: 'mock-sec-msg-id',
    });

    const secretPassword = 'SecretP@ssword999!';
    await request(app)
      .post('/api/auth/register/initiate')
      .send({
        name: 'Security User',
        email: testEmail,
        password: secretPassword,
      });

    logSpy.mockRestore();
    warnSpy.mockRestore();

    const allOutput = capturedLogs.join('\n');

    // Verify password is never logged
    expect(allOutput).not.toContain(secretPassword);

    // Verify no 6-digit OTP regex pattern is printed in plaintext log lines
    expect(allOutput).not.toMatch(/Generated registration OTP for.*:\s*\d{6}/);
    expect(allOutput).not.toMatch(/Resent registration OTP for.*:\s*\d{6}/);

    // Verify email was masked in logs
    expect(allOutput).toContain('***@example.com');
  });
});
