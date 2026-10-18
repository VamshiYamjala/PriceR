// server/src/models/MonitorRun.js
import mongoose from 'mongoose';

const monitorRunSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['running', 'completed', 'failed', 'interrupted'],
      default: 'running',
      index: true,
      required: true,
    },
    triggeredBy: {
      type: String,
      enum: ['github_actions', 'scheduler', 'user', 'manual_api', 'test'],
      default: 'github_actions',
    },
    startedAt: {
      type: Date,
      default: Date.now,
      index: true,
      required: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    durationMs: {
      type: Number,
      default: null,
    },
    offersAttempted: {
      type: Number,
      default: 0,
    },
    offersSuccessful: {
      type: Number,
      default: 0,
    },
    offersFailed: {
      type: Number,
      default: 0,
    },
    triggeredAlerts: {
      type: Number,
      default: 0,
    },
    errors: [
      {
        offerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Offer',
        },
        provider: {
          type: String,
        },
        message: {
          type: String,
        },
      },
    ],
    failureReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

// Helper method to produce sanitized public representation
monitorRunSchema.methods.toPublicJSON = function () {
  return {
    runId: this._id.toString(),
    status: this.status,
    triggeredBy: this.triggeredBy,
    startedAt: this.startedAt ? this.startedAt.toISOString() : null,
    completedAt: this.completedAt ? this.completedAt.toISOString() : null,
    durationMs: this.durationMs,
    offersAttempted: this.offersAttempted,
    offersSuccessful: this.offersSuccessful,
    offersFailed: this.offersFailed,
    triggeredAlerts: this.triggeredAlerts,
    errorsCount: this.errors ? this.errors.length : 0,
    errors: (this.errors || []).map((e) => ({
      offerId: e.offerId ? e.offerId.toString() : null,
      provider: e.provider || null,
      message: e.message || null,
    })),
    failureReason: this.failureReason,
  };
};

const MonitorRun = mongoose.model('MonitorRun', monitorRunSchema);
export default MonitorRun;
