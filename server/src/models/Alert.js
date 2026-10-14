// server/src/models/Alert.js
import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      required: true,
    },
    type: {
      type: String,
      enum: ['target_price', 'fixed_drop'],
      required: true,
    },
    targetPriceInPaise: {
      type: Number,
      required: function () {
        return this.type === 'target_price';
      },
      validate: {
        validator: function (v) {
          return v === undefined || v === null || Number.isInteger(v);
        },
        message: 'targetPriceInPaise must be an integer',
      },
    },
    dropAmountInPaise: {
      type: Number,
      required: function () {
        return this.type === 'fixed_drop';
      },
      validate: {
        validator: function (v) {
          return v === undefined || v === null || Number.isInteger(v);
        },
        message: 'dropAmountInPaise must be an integer',
      },
    },
    channels: {
      type: [String],
      enum: ['email', 'telegram'],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1,
        message: 'channels must contain at least one of "email" or "telegram"',
      },
    },
    status: {
      type: String,
      enum: ['active', 'paused'],
      required: true,
      default: 'active',
    },
    armed: {
      type: Boolean,
      required: true,
      default: true,
    },
    lastTriggeredAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

const Alert = mongoose.model('Alert', alertSchema);
export default Alert;
