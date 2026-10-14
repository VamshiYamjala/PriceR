// server/src/routes/notifications.js
// Owner: Member 3
// Notification history endpoints (Document 1 Section 6.5)

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listNotifications } from '../controllers/notificationsController.js';

const router = Router();

// All notification endpoints require an authenticated user
router.use(requireAuth);

// GET /api/notifications — retrieves notification delivery events for the logged-in user
router.get('/', listNotifications);

export default router;
