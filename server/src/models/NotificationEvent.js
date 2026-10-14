// server/src/models/NotificationEvent.js
import mongoose from 'mongoose';

const notificationEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert',
      required: true,
    },
    channel: {
      type: String,
      enum: ['email', 'telegram'],
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'skipped_duplicate'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    errorMessage: {
      type: String,
      required: false,
    },
    dedupeKey: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Second, independent safety net against double-sending — see Document 1
// Section 9.3. Member 4's code writes these documents; you own the schema.
notificationEventSchema.index({ alertId: 1, dedupeKey: 1 }, { unique: true });

const NotificationEvent = mongoose.model('NotificationEvent', notificationEventSchema);
export default NotificationEvent;
