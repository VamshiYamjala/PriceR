// server/src/routes/notificationPreferences.js
// Owner: Member 3
// Endpoints for user notification preferences (Document 1 Section 6.5)

import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../controllers/notificationsController.js';

const router = Router();

// Both endpoints require authentication — user scopes to req.user.id
router.use(requireAuth);

// GET /api/notification-preferences
router.get('/', getNotificationPreferences);

// PUT /api/notification-preferences
router.put(
  '/',
  [
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email address.')
      .normalizeEmail(),
  ],
  validate,
  updateNotificationPreferences
);

export default router;
