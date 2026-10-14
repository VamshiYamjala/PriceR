// server/src/controllers/productsController.js
import Product from '../models/Product.js';
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

export const searchProducts = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) {
    return res.status(200).json({ success: true, data: { products: [] } });
  }

  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const products = await Product.find({
    $or: [{ title: regex }, { brand: regex }, { model: regex }],
  }).limit(20);

  const productIds = products.map((p) => p._id);
  const offers = await Offer.find({ productId: { $in: productIds } });

  const offersByProduct = new Map();
  for (const offer of offers) {
    const key = offer.productId.toString();
    if (!offersByProduct.has(key)) offersByProduct.set(key, []);
    offersByProduct.get(key).push(toOfferSummary(offer));
  }

  const result = products.map((p) => ({
    id: p._id.toString(),
    title: p.title,
    brand: p.brand ?? null,
    variant: p.variant ?? null,
    offers: offersByProduct.get(p._id.toString()) ?? [],
  }));

  return res.status(200).json({ success: true, data: { products: result } });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Product not found.' },
    });
  }

  const offers = await Offer.find({ productId: product._id });
  return res.status(200).json({
    success: true,
    data: {
      product: {
        id: product._id.toString(),
        title: product.title,
        brand: product.brand ?? null,
        model: product.model ?? null,
        variant: product.variant ?? null,
        imageUrl: product.imageUrl ?? null,
      },
      offers: offers.map(toOfferSummary),
    },
  });
});
