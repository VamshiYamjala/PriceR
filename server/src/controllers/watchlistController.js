// server/src/controllers/watchlistController.js
import mongoose from 'mongoose';
import WatchlistItem from '../models/WatchlistItem.js';
import Offer from '../models/Offer.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function toOfferSummary(offer) {
  return {
    id: offer._id.toString(),
    provider: offer.provider,
    title: offer.title,
    priceInPaise: offer.priceInPaise,
    currency: offer.currency,
    availability: offer.availability,
    productUrl: offer.productUrl,
    isSample: offer.isSample,
    lastStatus: offer.lastStatus,
    lastSuccessAt: offer.lastSuccessAt,
  };
}

export const listWatchlist = asyncHandler(async (req, res) => {
  const items = await WatchlistItem.find({ userId: req.user.id }).sort({ createdAt: -1 });
  const offerIds = items.map((i) => i.offerId);
  const offers = await Offer.find({ _id: { $in: offerIds } });
  const offerById = new Map(offers.map((o) => [o._id.toString(), o]));

  const result = items
    .map((item) => {
      const offer = offerById.get(item.offerId.toString());
      if (!offer) return null;
      return {
        id: item._id.toString(),
        offer: toOfferSummary(offer),
        createdAt: item.createdAt,
      };
    })
    .filter(Boolean);

  return res.status(200).json({ success: true, data: { items: result } });
});

export const addToWatchlist = asyncHandler(async (req, res) => {
  const { offerId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(offerId)) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'offerId must be a valid id.' },
    });
  }

  const offer = await Offer.findById(offerId);
  if (!offer) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Offer not found.' },
    });
  }

  try {
    const item = await WatchlistItem.create({ userId: req.user.id, offerId });
    return res.status(201).json({
      success: true,
      data: {
        item: {
          id: item._id.toString(),
          offerId,
          createdAt: item.createdAt,
        },
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: 'This offer is already on your watchlist.' },
      });
    }
    throw err;
  }
});

export const removeFromWatchlist = asyncHandler(async (req, res) => {
  const result = await WatchlistItem.findOneAndDelete({
    _id: req.params.watchlistItemId,
    userId: req.user.id,
  });

  if (!result) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Watchlist item not found.' },
    });
  }

  return res.status(200).json({ success: true, data: { deleted: true } });
});
