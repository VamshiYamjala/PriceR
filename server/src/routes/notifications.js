// server/src/routes/notifications.js
import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  listNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../controllers/notificationsController.js';

const router = Router();

router.use(requireAuth);

router.get('/', listNotifications);
router.get('/preferences', getNotificationPreferences);
router.put(
  '/preferences',
  [body('email').optional().isEmail().withMessage('Please provide a valid email address.')],
  validate,
  updateNotificationPreferences
);

export default router;
