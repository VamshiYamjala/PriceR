// server/src/models/MonitorLock.js
import mongoose from 'mongoose';

const monitorLockSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: 'monitoring_cycle_lock',
    },
    isLocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    currentRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MonitorRun',
      default: null,
    },
    acquiredAt: {
      type: Date,
      default: null,
    },
    heartbeatAt: {
      type: Date,
      default: null,
      index: true,
    },
    instanceId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const MonitorLock = mongoose.model('MonitorLock', monitorLockSchema);
export default MonitorLock;
