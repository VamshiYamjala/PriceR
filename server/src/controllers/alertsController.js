// server/src/controllers/alertsController.js
import Alert from '../models/Alert.js';
import Offer from '../models/Offer.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function toPublicAlert(alert) {
  return {
    id: alert._id.toString(),
    offerId: alert.offerId.toString(),
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
  const alerts = await Alert.find({ userId: req.user.id }).sort({ createdAt: -1 });
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
  });

  return res.status(201).json({
    success: true,
    data: { alert: toPublicAlert(alert) },
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
