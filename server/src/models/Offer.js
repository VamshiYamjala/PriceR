// server/src/models/Offer.js
import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    provider: {
      type: String,
      enum: ['flipkart', 'amazon', 'dummyjson', 'mockshop', 'ebay', 'fixture', 'scrapling', 'apify'],
      required: true,
    },
    externalProductId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    productUrl: {
      type: String,
      required: true,
    },
    priceInPaise: {
      type: Number,
      required: true,
      // Enforced as an integer — never a float. See Document 1 Section 5.
      validate: {
        validator: Number.isInteger,
        message: 'priceInPaise must be an integer (rupees x 100, rounded)',
      },
    },
    originalPrice: {
      type: Number,
      required: false,
    },
    originalCurrency: {
      type: String,
      required: false,
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
    },
    availability: {
      type: String,
      enum: ['in_stock', 'out_of_stock', 'unknown'],
      required: true,
    },
    isSample: {
      type: Boolean,
      required: true,
      default: true,
    },
    dataStatus: {
      type: String,
      enum: ['sample', 'live', 'cached', 'unavailable'],
      default: 'sample',
    },
    lastFetchedAt: {
      type: Date,
      required: false,
    },
    lastSuccessAt: {
      type: Date,
      required: false,
    },
    lastStatus: {
      type: String,
      enum: ['ok', 'stale', 'error'],
      required: true,
      default: 'stale',
    },
    lastError: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// A real listing is uniquely identified by (provider, externalProductId) —
// the same retailer never assigns the same product id to two different
// listings, so this compound unique index stops duplicate Offer documents.
offerSchema.index({ provider: 1, externalProductId: 1 }, { unique: true });

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;
