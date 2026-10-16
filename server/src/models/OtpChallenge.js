// server/src/models/OtpChallenge.js
import mongoose from 'mongoose';

const otpChallengeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['register', 'login', 'reset_password'],
      default: 'register',
    },
    attempts: {
      type: Number,
      default: 0,
    },
    resendAvailableAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL auto-cleanup
    },
  },
  { timestamps: true }
);

const OtpChallenge = mongoose.model('OtpChallenge', otpChallengeSchema);
export default OtpChallenge;
