// server/src/controllers/notificationsController.js
import User from '../models/User.js';
import NotificationEvent from '../models/NotificationEvent.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const events = await NotificationEvent.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(100);

  return res.status(200).json({
    success: true,
    data: {
      events: events.map((e) => ({
        id: e._id.toString(),
        alertId: e.alertId.toString(),
        channel: e.channel,
        status: e.status,
        message: e.message,
        errorMessage: e.errorMessage ?? null,
        createdAt: e.createdAt,
      })),
    },
  });
});

export const getNotificationPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'User not found.' },
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      email: user.email,
      telegramChatId: user.telegramChatId ?? null,
      telegramLinked: Boolean(user.telegramChatId),
    },
  });
});

export const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'User not found.' },
    });
  }

  if (req.body.email !== undefined) {
    user.email = req.body.email;
    await user.save();
  }

  return res.status(200).json({
    success: true,
    data: {
      email: user.email,
      telegramChatId: user.telegramChatId ?? null,
      telegramLinked: Boolean(user.telegramChatId),
    },
  });
});
