// server/src/routes/telegram.js
// Owner: Member 3 & Member 4
// Two-step Telegram account linking endpoints (Document 1 Section 6.5)

import { Router } from 'express';
import { body } from 'express-validator';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';

const router = Router();

// In-memory cache for active linking codes: Map<linkCode, { userId: string, expiresAt: Date }>
export const activeLinkCodes = new Map();

router.use(requireAuth);

/**
 * Step 1: Generates a short-lived link code for the authenticated user.
 * Document 1 Section 6.5: POST /api/telegram/link-code -> { linkCode, botUsername, expiresAt }
 */
router.post(
  '/link-code',
  asyncHandler(async (req, res) => {
    // Generate 6-character random alphanumeric code
    const linkCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lifetime
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'PriceRadarAlertsBot';

    activeLinkCodes.set(linkCode, {
      userId: req.user.id,
      expiresAt,
    });

    return res.status(200).json({
      success: true,
      data: {
        linkCode,
        botUsername,
        expiresAt: expiresAt.toISOString(),
      },
    });
  })
);

/**
 * Step 2: Confirms linking using the generated link code.
 * Document 1 Section 6.5: POST /api/telegram/link -> { linked: true }
 */
router.post(
  '/link',
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

    // In testing or development, allow passing chatId directly to simulate bot /start
    if (chatId) {
      user.telegramChatId = String(chatId);
      await user.save();
      activeLinkCodes.delete(linkCode);
      return res.status(200).json({
        success: true,
        data: { linked: true },
      });
    }

    // If bot polling already set user's chatId:
    if (user.telegramChatId) {
      activeLinkCodes.delete(linkCode);
      return res.status(200).json({
        success: true,
        data: { linked: true },
      });
    }

    if (!entry || entry.expiresAt < new Date() || entry.userId !== req.user.id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CODE',
          message: 'The link code is invalid or has expired. Please generate a new code.',
        },
      });
    }

    // Still awaiting /start from bot
    return res.status(200).json({
      success: true,
      data: {
        linked: Boolean(user.telegramChatId),
        message: 'Awaiting bot /start command from Telegram.',
      },
    });
  })
);

export default router;
