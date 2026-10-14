// server/src/routes/alerts.js
import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  listAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
} from '../controllers/alertsController.js';

const router = Router();

router.use(requireAuth);

router.get('/', listAlerts);

router.post(
  '/',
  [
    body('offerId').notEmpty().withMessage('offerId is required.'),
    body('type')
      .isIn(['target_price', 'fixed_drop'])
      .withMessage('type must be target_price or fixed_drop.'),
    body('channels')
      .isArray({ min: 1 })
      .withMessage('channels must contain at least one channel.'),
  ],
  validate,
  createAlert
);

router.patch('/:alertId', updateAlert);
router.delete('/:alertId', deleteAlert);

export default router;
