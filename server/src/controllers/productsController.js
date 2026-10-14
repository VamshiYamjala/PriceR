// server/src/controllers/productsController.js
import Product from '../models/Product.js';
import Offer from '../models/Offer.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as dummyjsonProvider from '../providers/dummyjson.js';
import * as mockshopProvider from '../providers/mockshop.js';

function toOfferSummary(offer) {
  return {
    id: offer._id ? offer._id.toString() : offer.id,
    provider: offer.provider,
    title: offer.title,
    priceInPaise: offer.priceInPaise,
    originalPrice: offer.originalPrice ?? null,
    originalCurrency: offer.originalCurrency ?? null,
    currency: offer.currency,
    availability: offer.availability,
    productUrl: offer.productUrl,
    isSample: offer.isSample,
    dataStatus: offer.dataStatus || (offer.isSample ? 'sample' : 'live'),
    lastStatus: offer.lastStatus,
    lastSuccessAt: offer.lastSuccessAt,
  };
}

export const searchProducts = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  const category = (req.query.category || '').trim();
  const providerFilter = (req.query.provider || 'all').trim().toLowerCase();

  // If query is completely empty and no category is requested, return empty list
  if (!q && !category) {
    return res.status(200).json({ success: true, data: { products: [] } });
  }

  let dbProducts = [];

  // 1. Search local DB (fixtures and stored products) unless filtered out
  if (providerFilter === 'all' || providerFilter === 'fixture') {
    const dbQuery = {};
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      dbQuery.$or = [{ title: regex }, { brand: regex }, { model: regex }];
    }
    if (category && category !== 'all') {
      dbQuery.category = new RegExp(`^${category}$`, 'i');
    }

    dbProducts = await Product.find(dbQuery).limit(20);
  }

  const productIds = dbProducts.map((p) => p._id);
  const offers = await Offer.find({ productId: { $in: productIds } });

  const offersByProduct = new Map();
  for (const offer of offers) {
    const key = offer.productId.toString();
    if (!offersByProduct.has(key)) offersByProduct.set(key, []);
    offersByProduct.get(key).push(toOfferSummary(offer));
  }

  let combined = dbProducts.map((p) => ({
    id: p._id.toString(),
    title: p.title,
    brand: p.brand ?? null,
    model: p.model ?? null,
    variant: p.variant ?? null,
    category: p.category ?? 'electronics',
    description: p.description ?? '',
    imageUrl: p.imageUrl ?? null,
    sourceProvider: p.sourceProvider || 'fixture',
    dataStatus: p.dataStatus || 'sample',
    offers: offersByProduct.get(p._id.toString()) ?? [],
  }));

  // 2. Query DummyJSON external catalog for discovery (unless filtered to fixture only)
  if (providerFilter === 'all' || providerFilter === 'dummyjson') {
    try {
      const dummyRes = await dummyjsonProvider.searchProducts(q, { limit: 12 });
      if (dummyRes && Array.isArray(dummyRes.products)) {
        let dummyItems = dummyRes.products;
        if (category && category !== 'all') {
          dummyItems = dummyItems.filter(
            (p) => p.category?.toLowerCase() === category.toLowerCase()
          );
        }
        combined = combined.concat(dummyItems);
      }
    } catch (err) {
      console.warn('[search] DummyJSON discovery error:', err.message);
    }
  }

  // 3. Query mock.shop optional storefront if requested or matching apparel
  if (providerFilter === 'mockshop') {
    try {
      const mockRes = await mockshopProvider.searchProducts(q, { limit: 6 });
      if (mockRes && Array.isArray(mockRes.products)) {
        combined = combined.concat(mockRes.products);
      }
    } catch (err) {
      console.warn('[search] mock.shop error:', err.message);
    }
  }

  return res.status(200).json({ success: true, data: { products: combined } });
});

export const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // 1. Check if ID belongs to DummyJSON catalog
  if (productId.startsWith('dummyjson-')) {
    const dummyProduct = await dummyjsonProvider.getProductById(productId);
    if (!dummyProduct) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Sample product not found in DummyJSON catalog.' },
      });
    }
    return res.status(200).json({
      success: true,
      data: {
        product: {
          id: dummyProduct.id,
          title: dummyProduct.title,
          brand: dummyProduct.brand ?? null,
          model: dummyProduct.model ?? null,
          variant: dummyProduct.variant ?? null,
          category: dummyProduct.category ?? 'general',
          description: dummyProduct.description ?? '',
          imageUrl: dummyProduct.imageUrl ?? null,
          images: dummyProduct.images ?? [],
          sourceProvider: dummyProduct.sourceProvider,
          sourceUrl: dummyProduct.sourceUrl,
          dataStatus: dummyProduct.dataStatus,
        },
        offers: (dummyProduct.offers || []).map(toOfferSummary),
      },
    });
  }

  // 2. Check if ID belongs to mock.shop catalog
  if (productId.startsWith('mockshop-')) {
    const cleanId = productId.replace(/^mockshop-/, '');
    const mockRes = await mockshopProvider.searchProducts(cleanId, { limit: 1 });
    const mockProduct = mockRes?.products?.[0];
    if (!mockProduct) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Fictional item not found in mock.shop catalog.' },
      });
    }
    return res.status(200).json({
      success: true,
      data: {
        product: mockProduct,
        offers: mockProduct.offers.map(toOfferSummary),
      },
    });
  }

  // 3. Fallback to MongoDB Product lookup
  let product;
  try {
    product = await Product.findById(productId);
  } catch (err) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Product not found.' },
    });
  }

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
        category: product.category ?? 'electronics',
        description: product.description ?? '',
        imageUrl: product.imageUrl ?? null,
        sourceProvider: product.sourceProvider || 'fixture',
        dataStatus: product.dataStatus || 'sample',
      },
      offers: offers.map(toOfferSummary),
    },
  });
});

export const getCategories = asyncHandler(async (req, res) => {
  const dummyCategories = await dummyjsonProvider.getCategories();
  const localCategories = ['smartphones', 'audio', 'wearables', 'electronics'];
  const merged = Array.from(new Set([...localCategories, ...dummyCategories])).sort();

  return res.status(200).json({
    success: true,
    data: { categories: merged },
  });
});

export const getProviderStatus = asyncHandler(async (req, res) => {
  const providers = [
    {
      id: 'fixture',
      name: 'Fixture Dataset',
      type: 'sample',
      status: 'active',
      description: 'Deterministic multi-retailer test fixtures with simulated network delay.',
      requiresAuth: false,
    },
    {
      id: 'dummyjson',
      name: 'DummyJSON Catalog',
      type: 'sample',
      status: 'active',
      description: 'Primary free sample catalog for product exploration with USD->INR conversion.',
      requiresAuth: false,
    },
    {
      id: 'mockshop',
      name: 'Shopify mock.shop',
      type: 'sample',
      status: 'active',
      description: 'Fictional headless storefront GraphQL API for apparel exploration.',
      requiresAuth: false,
    },
    {
      id: 'flipkart',
      name: 'Flipkart Affiliate API',
      type: 'live',
      status: 'standby',
      description: 'Official retailer feed adapter (routed to fixture fallback until verified).',
      requiresAuth: true,
    },
    {
      id: 'amazon',
      name: 'Amazon India',
      type: 'sample',
      status: 'mock_only',
      description: 'Amazon mock-only policy (scraping strictly prohibited per compliance rules).',
      requiresAuth: false,
    },
    {
      id: 'ebay',
      name: 'eBay Browse API',
      type: 'live',
      status: process.env.EBAY_CLIENT_ID ? 'configured' : 'unconfigured',
      description: 'Official eBay Marketplace Browse API (OAuth 2.0 client credentials required).',
      requiresAuth: true,
    },
  ];

  return res.status(200).json({
    success: true,
    data: { providers },
  });
});

export default {
  searchProducts,
  getProductById,
  getCategories,
  getProviderStatus,
};
