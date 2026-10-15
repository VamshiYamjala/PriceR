// server/src/controllers/offersController.js
import Offer from '../models/Offer.js';
import PriceObservation from '../models/PriceObservation.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getOfferHistory = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.offerId);
  if (!offer) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Offer not found.' },
    });
  }

  const history = await PriceObservation.find({ offerId: offer._id })
    .sort({ fetchedAt: -1 })
    .limit(100);

  return res.status(200).json({
    success: true,
    data: {
      offerId: offer._id.toString(),
      history: history.map((h) => ({
        priceInPaise: h.priceInPaise ?? null,
        status: h.status,
        fetchedAt: h.fetchedAt,
      })),
    },
  });
});

export const getOfferById = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.offerId);
  if (!offer) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Offer not found.' },
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      offer: {
        id: offer._id.toString(),
        title: offer.title,
        priceInPaise: offer.priceInPaise,
        originalPriceInPaise: offer.originalPriceInPaise,
        provider: offer.provider,
        productUrl: offer.productUrl,
        imageUrl: offer.imageUrl,
        availability: offer.availability,
        dataStatus: offer.dataStatus,
        isSample: offer.isSample,
      },
    },
  });
});

export default { getOfferHistory, getOfferById };
