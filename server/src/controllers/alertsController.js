// server/src/controllers/alertsController.js
import Alert from '../models/Alert.js';
import Offer from '../models/Offer.js';
import User from '../models/User.js';
import { evaluateAlert } from '../services/alertEvaluator.js';
import { dispatchAlertNotifications } from '../services/alertDispatcher.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function toPublicAlert(alert) {
  const isPopulated = alert.offerId && typeof alert.offerId === 'object' && alert.offerId.title;
  return {
    id: alert._id.toString(),
    offerId: isPopulated ? alert.offerId._id.toString() : alert.offerId.toString(),
    offer: isPopulated
      ? {
          id: alert.offerId._id.toString(),
          title: alert.offerId.title,
          priceInPaise: alert.offerId.priceInPaise,
          provider: alert.offerId.provider,
          productUrl: alert.offerId.productUrl,
          imageUrl: alert.offerId.imageUrl,
        }
      : undefined,
    type: alert.type,
    targetPriceInPaise: alert.targetPriceInPaise ?? null,
    dropAmountInPaise: alert.dropAmountInPaise ?? null,
    channels: alert.channels,
    status: alert.status,
    armed: alert.armed,
    lastTriggeredAt: alert.lastTriggeredAt ?? null,
    createdAt: alert.createdAt,
  };
}

export const listAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find({ userId: req.user.id }).populate('offerId').sort({ createdAt: -1 });
  return res.status(200).json({
    success: true,
    data: { alerts: alerts.map(toPublicAlert) },
  });
});

export const createAlert = asyncHandler(async (req, res) => {
  const { offerId, type, targetPriceInPaise, dropAmountInPaise, channels } = req.body;
  const offer = await Offer.findById(offerId);

  if (!offer) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Offer not found.' },
    });
  }

  const alert = await Alert.create({
    userId: req.user.id,
    offerId,
    type,
    targetPriceInPaise: type === 'target_price' ? targetPriceInPaise : undefined,
    dropAmountInPaise: type === 'fixed_drop' ? dropAmountInPaise : undefined,
    channels,
    status: 'active',
    armed: true,
  });

  let triggeredImmediately = false;

  // Immediate evaluation for target_price alerts:
  // If the offer already satisfies the target condition (e.g. currentPrice <= targetPrice),
  // dispatch notification immediately and disarm the alert so the user is instantly notified.
  // Fixed-drop alerts establish baseline upon creation and do NOT trigger until a subsequent drop.
  if (type === 'target_price' && typeof offer.priceInPaise === 'number' && offer.priceInPaise > 0) {
    const evalResult = evaluateAlert(alert, offer.priceInPaise, null);
    if (evalResult.shouldNotify) {
      triggeredImmediately = true;
      alert.armed = false;
      alert.lastTriggeredAt = new Date();
      await alert.save();

      const user = await User.findById(req.user.id);
      await dispatchAlertNotifications({ alert, offer, user, evalResult });
    }
  }

  return res.status(201).json({
    success: true,
    data: {
      alert: toPublicAlert(alert),
      triggeredImmediately,
    },
  });
});

export const updateAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findOne({ _id: req.params.alertId, userId: req.user.id });
  if (!alert) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Alert not found.' },
    });
  }

  const allowedFields = ['status', 'targetPriceInPaise', 'dropAmountInPaise', 'channels'];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      alert[field] = req.body[field];
    }
  }

  await alert.save();
  return res.status(200).json({
    success: true,
    data: { alert: toPublicAlert(alert) },
  });
});

export const deleteAlert = asyncHandler(async (req, res) => {
  const result = await Alert.findOneAndDelete({ _id: req.params.alertId, userId: req.user.id });
  if (!result) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Alert not found.' },
    });
  }

  return res.status(200).json({
    success: true,
    data: { deleted: true },
  });
});
