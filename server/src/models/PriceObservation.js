// server/src/models/PriceObservation.js
import mongoose from 'mongoose';

const priceObservationSchema = new mongoose.Schema({
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    required: true,
  },
  priceInPaise: {
    type: Number,
    required: function () {
      // Only required when the fetch succeeded — a failed fetch has no price.
      return this.status === 'success';
    },
    validate: {
      validator: function (v) {
        return v === undefined || v === null || Number.isInteger(v);
      },
      message: 'priceInPaise must be an integer',
    },
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    required: true,
  },
  errorMessage: {
    type: String,
    required: false,
  },
  fetchedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// Fast "most recent observation(s) for this offer" queries, and the exact
// index Document 1 Section 5.4 calls for (offerId + fetchedAt together).
priceObservationSchema.index({ offerId: 1, fetchedAt: -1 });

const PriceObservation = mongoose.model('PriceObservation', priceObservationSchema);
export default PriceObservation;
