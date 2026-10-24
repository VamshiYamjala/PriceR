// server/tests/passwordReset.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import OtpChallenge from '../src/models/OtpChallenge.js';
import emailService from '../src/services/notifications/email.js';

describe('Password Reset with Email OTP Verification Test Suite', () => {
  const hasDb = Boolean(process.env.MONGODB_URI);
  const testEmails = [];
  const createdUserIds = [];

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

  async function createTestUser(email, initialPassword = 'OldPassword123!') {
    testEmails.push(email);
    const passwordHash = await bcrypt.hash(initialPassword, 10);
    const user = await User.create({
      name: 'Reset Test User',
      email,
      passwordHash,
    });
    createdUserIds.push(user._id);
    return user;
  }

  // 1. A registered email can request a reset OTP
  it('1. Registered email can request a reset OTP with generic response and email dispatched', async () => {
    const email = `reset_reg_${Date.now()}@example.com`;
    await createTestUser(email);

    let capturedOtp = null;
    jest.spyOn(emailService, 'sendOtpEmail').mockImplementationOnce(async ({ otpCode }) => {
      capturedOtp = otpCode;
      return { success: true, providerMessageId: 'mock-msg-1' };
    });

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toMatch(/verification code will be sent/i);
    expect(capturedOtp).toBeDefined();
    expect(capturedOtp).toMatch(/^\d{6}$/);

    const challenge = await OtpChallenge.findOne({ email, purpose: 'reset_password' });
    expect(challenge).not.toBeNull();
    expect(challenge.otpHash).toBeDefined();
    expect(res.body.data.otp).toBeUndefined(); // OTP is never exposed in response
  });

  // 2. An unregistered email receives a generic response (no account enumeration)
  it('2. Unregistered email receives the exact same generic response without sending email', async () => {
    const email = `nonexistent_${Date.now()}@example.com`;
    testEmails.push(email);

    const emailSpy = jest.spyOn(emailService, 'sendOtpEmail');

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toMatch(/verification code will be sent/i);
    expect(emailSpy).not.toHaveBeenCalled();

    const challenge = await OtpChallenge.findOne({ email, purpose: 'reset_password' });
    expect(challenge).toBeNull();
  });

  // 3. An incorrect OTP is rejected with remaining attempts
  it('3. Incorrect OTP is rejected with remaining attempts count', async () => {
    const email = `reset_fail_${Date.now()}@example.com`;
    await createTestUser(email);

    jest.spyOn(emailService, 'sendOtpEmail').mockResolvedValueOnce({ success: true });

    await request(app).post('/api/auth/forgot-password').send({ email });

    const res = await request(app)
      .post('/api/auth/verify-reset-otp')
      .send({ email, otp: '000000' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('OTP_INVALID');
    expect(res.body.error.message).toMatch(/4 attempt\(s\) remaining/);
  });

  // 4. An expired OTP is rejected
  it('4. Expired OTP is rejected and purged', async () => {
    const email = `reset_exp_${Date.now()}@example.com`;
    await createTestUser(email);

    jest.spyOn(emailService, 'sendOtpEmail').mockResolvedValueOnce({ success: true });
    await request(app).post('/api/auth/forgot-password').send({ email });

    // Force expiration in database
    await OtpChallenge.updateOne(
      { email, purpose: 'reset_password' },
      { $set: { expiresAt: new Date(Date.now() - 1000) } }
    );

    const res = await request(app)
      .post('/api/auth/verify-reset-otp')
      .send({ email, otp: '123456' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('OTP_EXPIRED');

    const challenge = await OtpChallenge.findOne({ email, purpose: 'reset_password' });
    expect(challenge).toBeNull();
  });

  // 5. Excessive verification attempts are blocked
  it('5. Excessive verification attempts (5) are blocked with 429 and challenge deleted', async () => {
    const email = `reset_brute_${Date.now()}@example.com`;
    await createTestUser(email);

    jest.spyOn(emailService, 'sendOtpEmail').mockResolvedValueOnce({ success: true });
    await request(app).post('/api/auth/forgot-password').send({ email });

    // Set attempts to 5
    await OtpChallenge.updateOne(
      { email, purpose: 'reset_password' },
      { $set: { attempts: 5 } }
    );

    const res = await request(app)
      .post('/api/auth/verify-reset-otp')
      .send({ email, otp: '123456' });

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('TOO_MANY_ATTEMPTS');

    const challenge = await OtpChallenge.findOne({ email, purpose: 'reset_password' });
    expect(challenge).toBeNull();
  });

  // 6. Resend cooldown and rate limits work
  it('6. Resend cooldown enforces rate limits before allowed interval', async () => {
    const email = `reset_cooldown_${Date.now()}@example.com`;
    await createTestUser(email);

    jest.spyOn(emailService, 'sendOtpEmail').mockResolvedValueOnce({ success: true });
    await request(app).post('/api/auth/forgot-password').send({ email });

    // Immediate resend should trigger 429
    const res = await request(app)
      .post('/api/auth/resend-reset-otp')
      .send({ email });

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('RATE_LIMITED');
    expect(res.body.error.remainingSeconds).toBeGreaterThan(0);
  });

  // 7. A new OTP invalidates the previous OTP
  it('7. A new OTP invalidates the previous OTP upon resend', async () => {
    const email = `reset_inval_${Date.now()}@example.com`;
    await createTestUser(email);

    let otp1 = null;
    let otp2 = null;

    jest.spyOn(emailService, 'sendOtpEmail')
      .mockImplementationOnce(async ({ otpCode }) => {
        otp1 = otpCode;
        return { success: true };
      })
      .mockImplementationOnce(async ({ otpCode }) => {
        otp2 = otpCode;
        return { success: true };
      });

    await request(app).post('/api/auth/forgot-password').send({ email });

    // Simulate elapsed cooldown
    await OtpChallenge.updateOne(
      { email, purpose: 'reset_password' },
      { $set: { resendAvailableAt: new Date(Date.now() - 1000) } }
    );

    // Resend OTP
    const resendRes = await request(app)
      .post('/api/auth/resend-reset-otp')
      .send({ email });
    expect(resendRes.status).toBe(200);

    // Attempting to verify the OLD otp1 must fail
    const oldVerify = await request(app)
      .post('/api/auth/verify-reset-otp')
      .send({ email, otp: otp1 });
    expect(oldVerify.status).toBe(400);
    expect(oldVerify.body.error.code).toBe('OTP_INVALID');

    // Verifying the NEW otp2 must succeed
    const newVerify = await request(app)
      .post('/api/auth/verify-reset-otp')
      .send({ email, otp: otp2 });
    expect(newVerify.status).toBe(200);
    expect(newVerify.body.data.resetToken).toBeDefined();
  });

  // 8. An unverified user cannot reset a password
  it('8. Reset password without verified authorization token is rejected with 403', async () => {
    const email = `reset_unauth_${Date.now()}@example.com`;
    await createTestUser(email);

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({
        email,
        resetToken: 'fake_unauthorized_token_123',
        newPassword: 'BrandNewPassword123!',
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('RESET_UNAUTHORIZED');
  });

  // 9. Password confirmation mismatch / invalid token is rejected
  it('9. Tampered reset authorization token is rejected with 403', async () => {
    const email = `reset_tamper_${Date.now()}@example.com`;
    await createTestUser(email);

    let validOtp = null;
    jest.spyOn(emailService, 'sendOtpEmail').mockImplementationOnce(async ({ otpCode }) => {
      validOtp = otpCode;
      return { success: true };
    });

    await request(app).post('/api/auth/forgot-password').send({ email });
    await request(app).post('/api/auth/verify-reset-otp').send({ email, otp: validOtp });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({
        email,
        resetToken: 'wrong_tampered_token_abcdef1234567890',
        newPassword: 'BrandNewPassword123!',
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('RESET_TOKEN_INVALID');
  });

  // 10. A weak or invalid password (<8 chars) is rejected
  it('10. Short password (< 8 chars) is rejected according to policy', async () => {
    const email = `reset_short_${Date.now()}@example.com`;
    await createTestUser(email);

    let validOtp = null;
    jest.spyOn(emailService, 'sendOtpEmail').mockImplementationOnce(async ({ otpCode }) => {
      validOtp = otpCode;
      return { success: true };
    });

    await request(app).post('/api/auth/forgot-password').send({ email });
    const verifyRes = await request(app).post('/api/auth/verify-reset-otp').send({ email, otp: validOtp });
    const resetToken = verifyRes.body.data.resetToken;

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({
        email,
        resetToken,
        newPassword: 'short',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/at least 8 characters/);
  });

  // 11 - 14. Full end-to-end reset, password hash change, old fails, new succeeds, token consumed
  it('11-14. Complete end-to-end reset: password changes, old fails, new succeeds, token cannot be reused', async () => {
    const email = `reset_complete_${Date.now()}@example.com`;
    const oldPassword = 'OldInitialPassword123!';
    const newPassword = 'NewlyUpdatedPassword123!';

    const user = await createTestUser(email, oldPassword);
    const initialHash = user.passwordHash;

    let validOtp = null;
    jest.spyOn(emailService, 'sendOtpEmail').mockImplementationOnce(async ({ otpCode }) => {
      validOtp = otpCode;
      return { success: true };
    });

    // Step 1: Request OTP
    const step1 = await request(app).post('/api/auth/forgot-password').send({ email });
    expect(step1.status).toBe(200);

    // Step 2: Verify OTP
    const step2 = await request(app).post('/api/auth/verify-reset-otp').send({ email, otp: validOtp });
    expect(step2.status).toBe(200);
    const resetToken = step2.body.data.resetToken;
    expect(resetToken).toBeDefined();

    // Step 3: Set new password
    const step3 = await request(app).post('/api/auth/reset-password').send({
      email,
      resetToken,
      newPassword,
    });
    expect(step3.status).toBe(200);
    expect(step3.body.data.message).toMatch(/password has been reset successfully/i);

    // Check 11: Stored password hash changed
    const updatedUser = await User.findOne({ email }).select('+passwordHash');
    expect(updatedUser.passwordHash).not.toBe(initialHash);

    // Check 12: Old password fails login
    const oldLogin = await request(app).post('/api/auth/login').send({
      email,
      password: oldPassword,
    });
    expect(oldLogin.status).toBe(401);

    // Check 13: New password succeeds login
    const newLogin = await request(app).post('/api/auth/login').send({
      email,
      password: newPassword,
    });
    expect(newLogin.status).toBe(200);
    expect(newLogin.body.data.token).toBeDefined();
    expect(newLogin.body.data.user.email).toBe(email);

    // Check 14: Reset token cannot be reused
    const reuseAttempt = await request(app).post('/api/auth/reset-password').send({
      email,
      resetToken,
      newPassword: 'AnotherPassword123!',
    });
    expect(reuseAttempt.status).toBe(403);
  });

  // 15. Existing registration, login, and JWT continue working
  it('15. Normal login, registration, and JWT continue working seamlessly', async () => {
    const email = `normal_auth_${Date.now()}@example.com`;
    const password = 'NormalPassword123!';

    const reg = await request(app).post('/api/auth/register').send({
      name: 'Normal User',
      email,
      password,
    });
    expect(reg.status).toBe(201);
    createdUserIds.push(reg.body.data.user.id);
    testEmails.push(email);

    const loginRes = await request(app).post('/api/auth/login').send({ email, password });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.data.token;

    const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe(email);
  });

  // 16. Sensitive OTP values never leak in API responses
  it('16. OTP values and reset hashes never leak in API responses', async () => {
    const email = `leak_check_${Date.now()}@example.com`;
    await createTestUser(email);

    jest.spyOn(emailService, 'sendOtpEmail').mockResolvedValueOnce({ success: true });

    const res = await request(app).post('/api/auth/forgot-password').send({ email });
    const jsonStr = JSON.stringify(res.body);

    expect(jsonStr).not.toMatch(/otpCode/i);
    expect(jsonStr).not.toMatch(/otpHash/i);
  });

  // 17. Email provider failure handled safely
  it('17. Email delivery failure returns 503 and deletes unusable challenge', async () => {
    const email = `email_fail_${Date.now()}@example.com`;
    await createTestUser(email);

    jest.spyOn(emailService, 'sendOtpEmail').mockResolvedValueOnce({
      success: false,
      errorMessage: 'Brevo API key invalid or rate limited',
    });

    const res = await request(app).post('/api/auth/forgot-password').send({ email });
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('EMAIL_DELIVERY_FAILED');

    // Challenge should not remain orphaned
    const challenge = await OtpChallenge.findOne({ email, purpose: 'reset_password' });
    expect(challenge).toBeNull();
  });
});
