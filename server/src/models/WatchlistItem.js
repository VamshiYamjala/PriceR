// server/src/models/WatchlistItem.js
import mongoose from 'mongoose';

const watchlistItemSchema = new mongoose.Schema(
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
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// A user cannot watch the same offer twice.
watchlistItemSchema.index({ userId: 1, offerId: 1 }, { unique: true });

const WatchlistItem = mongoose.model('WatchlistItem', watchlistItemSchema);
export default WatchlistItem;
