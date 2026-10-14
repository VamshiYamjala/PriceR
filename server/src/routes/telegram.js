// server/src/routes/telegram.js
import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';

const router = Router();

router.use(requireAuth);

// Shell for linking Telegram chat code to authenticated user
router.post(
  '/link-code',
  [body('linkCode').trim().notEmpty().withMessage('linkCode is required.')],
  validate,
  asyncHandler(async (req, res) => {
    const { linkCode } = req.body;
    // Coordinate with Member 4's telegramLinkCodes service
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } });
    }

    return res.status(200).json({
      success: true,
      data: {
        message: 'Telegram link request received. Bot confirmation required.',
        linkCode,
      },
    });
  })
);

export default router;
