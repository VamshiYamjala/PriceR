// server/src/routes/telegram.js
// Owner: Member 3 & Member 4
// Secure Telegram account linking & unlinking endpoints (Document 1 Section 6.5)

import { Router } from 'express';
import { body } from 'express-validator';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';

const router = Router();

// In-memory cache for active linking codes: Map<linkCode, { userId: string, expiresAt: Date }>
export const activeLinkCodes = new Map();

// Helper: sweeps expired codes from memory
export function cleanupExpiredCodes() {
  const now = new Date();
  for (const [code, entry] of activeLinkCodes.entries()) {
    if (entry.expiresAt < now) {
      activeLinkCodes.delete(code);
    }
  }
}

// Rate limiters: protect against spamming code creation and brute forcing codes
const linkCodeLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many link code requests. Please wait a minute.',
});

const linkVerifyLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 15,
  message: 'Too many linking attempts. Please wait a minute.',
});

router.use(requireAuth);

/**
 * Step 1: Generates a short-lived, single-use link code with Telegram deep link.
 * POST /api/telegram/link-code -> { linkCode, botUsername, botDeepLink, expiresAt }
 */
router.post(
  '/link-code',
  linkCodeLimiter,
  asyncHandler(async (req, res) => {
    cleanupExpiredCodes();
    // Generate 6-character random alphanumeric code
    const linkCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lifetime
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'PriceRadar_Alerts_Bot';
    const botDeepLink = `https://t.me/${botUsername}?start=${linkCode}`;

    // Associate code with authenticated user
    activeLinkCodes.set(linkCode, {
      userId: req.user.id,
      expiresAt,
    });

    return res.status(200).json({
      success: true,
      data: {
        linkCode,
        botUsername,
        botDeepLink,
        expiresAt: expiresAt.toISOString(),
      },
    });
  })
);

/**
 * Step 2: Confirms linking using the generated link code.
 * POST /api/telegram/link -> { linked: boolean }
 */
router.post(
  '/link',
  linkVerifyLimiter,
  [body('linkCode').trim().notEmpty().withMessage('linkCode is required.')],
  validate,
  asyncHandler(async (req, res) => {
    const { linkCode, chatId } = req.body;
    const entry = activeLinkCodes.get(linkCode);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found.' },
      });
    }

    // In testing or simulation mode: allow providing chatId directly
    if (chatId) {
      if (!entry || entry.expiresAt < new Date() || entry.userId !== req.user.id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CODE',
            message: 'The link code is invalid, expired, or belongs to another user.',
          },
        });
      }
      user.telegramChatId = String(chatId);
      await user.save();
      activeLinkCodes.delete(linkCode); // Single-use consumption
      return res.status(200).json({
        success: true,
        data: { linked: true, telegramChatId: user.telegramChatId },
      });
    }

    // If polling listener already linked the user:
    if (user.telegramChatId) {
      activeLinkCodes.delete(linkCode);
      return res.status(200).json({
        success: true,
        data: { linked: true, telegramChatId: user.telegramChatId },
      });
    }

    // Check code validity
    if (!entry || entry.expiresAt < new Date() || entry.userId !== req.user.id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CODE',
          message: 'The link code is invalid, expired, or belongs to another user. Please generate a new code.',
        },
      });
    }

    // Still awaiting /start from bot
    return res.status(200).json({
      success: true,
      data: {
        linked: false,
        message: 'Awaiting bot /start command in Telegram. Click the deep link and press Start.',
      },
    });
  })
);

/**
 * Disconnects the user's linked Telegram chat.
 * POST /api/telegram/disconnect -> { linked: false }
 */
router.post(
  '/disconnect',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found.' },
      });
    }

    user.telegramChatId = null;
    await user.save();

    // Clean up any remaining active codes for this user
    for (const [code, val] of activeLinkCodes.entries()) {
      if (val.userId === req.user.id) {
        activeLinkCodes.delete(code);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        linked: false,
        message: 'Telegram account has been disconnected.',
      },
    });
  })
);

export default router;
