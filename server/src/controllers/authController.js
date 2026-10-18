// server/src/controllers/authController.js
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OtpChallenge from '../models/OtpChallenge.js';
import emailService from '../services/notifications/email.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function toPublicUser(userDoc) {
  return {
    id: userDoc._id.toString(),
    name: userDoc.name,
    email: userDoc.email,
    telegramChatId: userDoc.telegramChatId ?? null,
  };
}

function signToken(userId) {
  return jwt.sign({ sub: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function hashOtp(code) {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
}

function maskEmail(email) {
  if (!email || typeof email !== 'string') return '***';
  const [user, domain] = email.split('@');
  if (!domain) return '***';
  const visible = user.slice(0, 2);
  return `${visible}***@${domain}`;
}

/**
 * Step 1 of Registration: Initiates email OTP verification.
 * Generates a 6-digit code, hashes the password & code, saves the challenge,
 * and sends the code to the user's email via Brevo.
 */
export const initiateRegistration = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: 'An account with this email already exists.' },
    });
  }

  // Generate cryptographically random 6-digit numeric OTP
  const otpCode = crypto.randomInt(100000, 999999).toString();
  const otpHash = hashOtp(otpCode);
  const passwordHash = await bcrypt.hash(password, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const resendAvailableAt = new Date(Date.now() + 60 * 1000); // 60s cooldown

  const challenge = await OtpChallenge.findOneAndUpdate(
    { email: normalizedEmail, purpose: 'register' },
    {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      otpHash,
      purpose: 'register',
      attempts: 0,
      resendAvailableAt,
      expiresAt,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Send verification email via Brevo
  const emailRes = await emailService.sendOtpEmail({
    to: normalizedEmail,
    otpCode,
    name: name.trim(),
    purpose: 'Account Registration',
  });

  // Check if provider accepted the submission
  if (!emailRes.success) {
    // Delete unusable challenge so user is not trapped in an orphaned session
    await OtpChallenge.deleteOne({ _id: challenge._id });

    console.warn(
      `[auth-otp] Verification email dispatch failed for ${maskEmail(normalizedEmail)}: ${emailRes.errorMessage || 'Provider rejected request'}`
    );

    return res.status(503).json({
      success: false,
      error: {
        code: 'EMAIL_DELIVERY_FAILED',
        message: 'Unable to send verification email at this time. Please check your email address or try again in a few minutes.',
      },
    });
  }

  // Safe sanitized log — never exposes plaintext OTP or secret values
  console.log(
    `[auth-otp] Registration OTP accepted by provider for ${maskEmail(normalizedEmail)} (messageId: ${emailRes.providerMessageId || 'accepted'})`
  );

  return res.status(200).json({
    success: true,
    data: {
      email: normalizedEmail,
      message: 'Verification code sent to your email address.',
      resendCooldownSeconds: 60,
    },
  });
});

/**
 * Step 2 of Registration: Verifies OTP, persists User, and signs JWT.
 */
export const verifyRegistration = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = (email || '').trim().toLowerCase();
  const submittedOtp = (otp || '').trim();

  if (!normalizedEmail || !submittedOtp) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Email and OTP are required.' },
    });
  }

  // Double check existing user
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: 'An account with this email already exists.' },
    });
  }

  const challenge = await OtpChallenge.findOne({
    email: normalizedEmail,
    purpose: 'register',
  });

  if (!challenge) {
    return res.status(400).json({
      success: false,
      error: { code: 'OTP_NOT_FOUND', message: 'No pending registration request found for this email. Please register again.' },
    });
  }

  if (new Date() > challenge.expiresAt) {
    await OtpChallenge.deleteOne({ _id: challenge._id });
    return res.status(400).json({
      success: false,
      error: { code: 'OTP_EXPIRED', message: 'Verification code has expired. Please request a new code.' },
    });
  }

  if (challenge.attempts >= 5) {
    await OtpChallenge.deleteOne({ _id: challenge._id });
    return res.status(429).json({
      success: false,
      error: { code: 'TOO_MANY_ATTEMPTS', message: 'Too many incorrect attempts. Please initiate registration again.' },
    });
  }

  const submittedHash = hashOtp(submittedOtp);
  if (submittedHash !== challenge.otpHash) {
    challenge.attempts += 1;
    await challenge.save();
    const remainingAttempts = 5 - challenge.attempts;
    return res.status(400).json({
      success: false,
      error: {
        code: 'OTP_INVALID',
        message: `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`,
      },
    });
  }

  // OTP verified successfully! Create user account
  const user = await User.create({
    name: challenge.name,
    email: challenge.email,
    passwordHash: challenge.passwordHash,
  });

  // Clean up the used challenge
  await OtpChallenge.deleteOne({ _id: challenge._id });

  // Issue token for instant authenticated login
  const token = signToken(user._id);

  return res.status(201).json({
    success: true,
    data: {
      token,
      user: toPublicUser(user),
    },
  });
});

/**
 * Resends a fresh registration OTP to the user's email if cooldown elapsed.
 */
export const resendRegistrationOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = (email || '').trim().toLowerCase();

  const challenge = await OtpChallenge.findOne({
    email: normalizedEmail,
    purpose: 'register',
  });

  if (!challenge) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'No registration session found for this email.' },
    });
  }

  if (challenge.resendAvailableAt && new Date() < challenge.resendAvailableAt) {
    const remainingSecs = Math.ceil((challenge.resendAvailableAt.getTime() - Date.now()) / 1000);
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: `Please wait ${remainingSecs} seconds before requesting a new code.`,
        remainingSeconds: remainingSecs,
      },
    });
  }

  // Generate candidate new OTP
  const otpCode = crypto.randomInt(100000, 999999).toString();

  // Attempt sending fresh verification email before overwriting challenge
  // Preserves existing valid challenge if provider rejects the resend
  const emailRes = await emailService.sendOtpEmail({
    to: normalizedEmail,
    otpCode,
    name: challenge.name,
    purpose: 'Account Registration',
  });

  if (!emailRes.success) {
    console.warn(
      `[auth-otp] Resend verification email failed for ${maskEmail(normalizedEmail)}: ${emailRes.errorMessage || 'Provider rejected request'}`
    );

    return res.status(503).json({
      success: false,
      error: {
        code: 'EMAIL_DELIVERY_FAILED',
        message: 'Unable to send fresh verification code at this time. Please try again in a moment.',
      },
    });
  }

  // Provider accepted: now update challenge state
  challenge.otpHash = hashOtp(otpCode);
  challenge.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  challenge.resendAvailableAt = new Date(Date.now() + 60 * 1000);
  challenge.attempts = 0;
  await challenge.save();

  // Safe sanitized log — never exposes plaintext OTP or secret values
  console.log(
    `[auth-otp] Resend OTP accepted by provider for ${maskEmail(normalizedEmail)} (messageId: ${emailRes.providerMessageId || 'accepted'})`
  );

  return res.status(200).json({
    success: true,
    data: {
      message: 'A fresh verification code has been sent to your email.',
      resendCooldownSeconds: 60,
    },
  });
});

/**
 * Direct registration endpoint (backward-compatible for existing automated tests).
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    return res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: 'An account with this email already exists.' },
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
  });

  return res.status(201).json({
    success: true,
    data: { user: toPublicUser(user) },
  });
});


export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_INVALID', message: 'Invalid email or password.' },
    });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_INVALID', message: 'Invalid email or password.' },
    });
  }

  const token = signToken(user._id);
  return res.status(200).json({
    success: true,
    data: {
      token,
      user: toPublicUser(user),
    },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'User not found.' },
    });
  }
  return res.status(200).json({ success: true, data: { user: toPublicUser(user) } });
});
