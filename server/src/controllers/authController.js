// server/src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
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
