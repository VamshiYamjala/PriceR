// server/src/controllers/productsController.js
import Product from '../models/Product.js';
import Offer from '../models/Offer.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as dummyjsonProvider from '../providers/dummyjson.js';
import * as mockshopProvider from '../providers/mockshop.js';
import * as apifyProvider from '../providers/apify.js';
import * as ebayProvider from '../providers/ebay.js';

function toOfferSummary(offer) {
  const rawRetailer = offer.retailer || (
    offer.provider === 'apify'
      ? (offer.externalProductId?.startsWith('flipkart') ? 'flipkart' : offer.externalProductId?.startsWith('meesho') ? 'meesho' : 'amazon')
      : (offer.provider === 'fixture' ? 'amazon' : offer.provider)
  );

  return {
    id: offer._id ? offer._id.toString() : offer.id,
    provider: offer.provider,
    retailer: rawRetailer,
    title: offer.title,
    priceInPaise: offer.priceInPaise,
    originalPrice: offer.originalPrice ?? null,
    originalCurrency: offer.originalCurrency ?? null,
    currency: offer.currency,
    crossCurrencyComparable: offer.crossCurrencyComparable ?? (offer.currency === 'INR'),
    availability: offer.availability,
    productUrl: offer.productUrl,
    isSample: offer.isSample,
    dataStatus: offer.dataStatus || (offer.isSample ? 'sample' : 'live'),
    lastStatus: offer.lastStatus,
    lastSuccessAt: offer.lastSuccessAt,
  };
}

const CATEGORY_MAP = {
  audio: /audio|headphone|earphone|earbuds|speaker|soundbar|airpods/i,
  laptops: /laptop|notebook|macbook|chromebook|thinkpad/i,
  cameras: /camera|dslr|lens|mirrorless|camcorder/i,
  smartphones: /phone|smartphone|mobile|iphone|galaxy|pixel|oneplus|redmi/i,
  wearables: /watch|smartwatch|band|fitness|tracker/i,
  electronics: /electronics|gadget|tablet|ipad|monitor/i,
};

export const searchProducts = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  const category = (req.query.category || '').trim();
  const providerFilter = (req.query.provider || 'all').trim().toLowerCase();

  // If query is completely empty and no category is requested, return empty list
  if (!q && !category) {
    return res.status(200).json({ success: true, data: { products: [], alternatives: [] } });
  }

  let dbProducts = [];

  // 1. Search local DB (fixtures and stored products) unless filtered out
  if (providerFilter === 'all' || providerFilter === 'fixture' || providerFilter === 'live') {
    const dbQuery = {};
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      dbQuery.$or = [{ title: regex }, { brand: regex }, { model: regex }];
    }
    if (category && category !== 'all') {
      const catRegex = CATEGORY_MAP[category.toLowerCase()] || new RegExp(`^${category}$`, 'i');
      if (dbQuery.$or) {
        dbQuery.$and = [
          { $or: dbQuery.$or },
          { $or: [{ category: catRegex }, { title: catRegex }] },
        ];
        delete dbQuery.$or;
      } else {
        dbQuery.$or = [{ category: catRegex }, { title: catRegex }];
      }
    }

    dbProducts = await Product.find(dbQuery).limit(30);
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

  // 2. Query Apify Actor for genuine live retailer data (Amazon, Flipkart, Meesho)
  const isApifyTargeted =
    (providerFilter === 'all' && process.env.NODE_ENV !== 'test') ||
    providerFilter === 'apify' ||
    providerFilter === 'live' ||
    ['amazon', 'flipkart', 'meesho'].includes(providerFilter);

  const effectiveApifyQuery = q || (category && category !== 'all' ? (
    category === 'audio' ? 'wireless headphones' :
    category === 'laptops' ? 'laptop' :
    category === 'cameras' ? 'camera' :
    category === 'smartphones' ? 'smartphone' : category
  ) : '');

  if (isApifyTargeted && effectiveApifyQuery && Product.db?.readyState === 1) {
    const apifyConfig = apifyProvider.getApifyConfig();
    if (apifyConfig.isConfigured) {
      try {
        let retailer = 'amazon';
        if (providerFilter === 'flipkart') retailer = 'flipkart';
        else if (providerFilter === 'meesho') retailer = 'meesho';
        else if (req.query.retailer) retailer = req.query.retailer.toLowerCase();

        const apifyRes = await apifyProvider.searchProducts(effectiveApifyQuery, {
          retailer,
          limit: apifyConfig.maxItems,
        });

        if (apifyRes && Array.isArray(apifyRes.products) && apifyRes.products.length > 0) {
          const liveItems = [];

          for (const item of apifyRes.products) {
            try {
              const canonicalKey = item.canonicalKey || `apify-${item.sourceProvider || retailer}-${item.externalId}`.toLowerCase();
              const persistedProduct = await Product.findOneAndUpdate(
                { canonicalKey },
                {
                  title: item.title,
                  brand: item.brand,
                  model: item.model,
                  variant: item.variant,
                  category: item.category || (category && category !== 'all' ? category : 'electronics'),
                  description: item.description,
                  imageUrl: item.imageUrl,
                  sourceProvider: 'apify',
                  externalId: item.externalId,
                  sourceUrl: item.sourceUrl,
                  dataStatus: 'live', // Genuine live retailer data
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
              );

              const offerData = item.offers?.[0];
              if (offerData && persistedProduct) {
                const persistedOffer = await Offer.findOneAndUpdate(
                  { provider: 'apify', externalProductId: String(offerData.externalProductId) },
                  {
                    productId: persistedProduct._id,
                    retailer: item.sourceProvider || retailer,
                    title: offerData.title || item.title,
                    productUrl: offerData.productUrl || item.sourceUrl,
                    priceInPaise: offerData.priceInPaise,
                    originalPrice: offerData.originalPrice,
                    originalCurrency: offerData.originalCurrency,
                    currency: offerData.currency || 'INR',
                    availability: offerData.availability || 'in_stock',
                    isSample: false,
                    dataStatus: 'live',
                    lastStatus: 'ok',
                    lastSuccessAt: new Date(),
                  },
                  { upsert: true, new: true, setDefaultsOnInsert: true }
                );

                item.id = persistedProduct._id.toString();
                item.offers = [toOfferSummary(persistedOffer)];
                liveItems.push(item);
              }
            } catch (persistErr) {
              console.warn('[search] Failed to persist Apify live item:', persistErr.message);
            }
          }

          // Prepend genuine live products so they rank prominently above sample data
          combined = liveItems.concat(combined);
        }
      } catch (apifyErr) {
        console.warn('[search] Apify live search error:', apifyErr.message);
      }
    }
  }

  // 2b. Query eBay Browse API when targeted or when configured alongside live retailers
  const isEbayTargeted =
    providerFilter === 'ebay' ||
    (providerFilter === 'live' && req.query.retailer === 'ebay') ||
    (providerFilter === 'all' && ebayProvider.isConfigured() && process.env.NODE_ENV !== 'test');

  if (isEbayTargeted && q && Product.db?.readyState === 1 && ebayProvider.isConfigured()) {
    try {
      const ebayRes = await ebayProvider.searchProducts(q, { limit: 10 });
      if (ebayRes && Array.isArray(ebayRes.products) && ebayRes.products.length > 0) {
        const ebayItems = [];
        for (const item of ebayRes.products) {
          try {
            const canonicalKey = item.canonicalKey || `ebay-${item.externalId}`.toLowerCase();
            const persistedProduct = await Product.findOneAndUpdate(
              { canonicalKey },
              {
                title: item.title,
                brand: item.brand,
                model: item.model,
                variant: item.variant,
                category: item.category || 'marketplace',
                description: item.description,
                imageUrl: item.imageUrl,
                sourceProvider: 'ebay',
                externalId: item.externalId,
                sourceUrl: item.sourceUrl,
                dataStatus: item.dataStatus || 'live',
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            const offerData = item.offers?.[0];
            if (offerData && persistedProduct) {
              const persistedOffer = await Offer.findOneAndUpdate(
                { provider: 'ebay', externalProductId: String(offerData.externalProductId) },
                {
                  productId: persistedProduct._id,
                  retailer: 'ebay',
                  title: offerData.title || item.title,
                  productUrl: offerData.productUrl || item.sourceUrl,
                  priceInPaise: offerData.priceInPaise,
                  originalPrice: offerData.originalPrice,
                  originalCurrency: offerData.originalCurrency,
                  currency: offerData.currency || 'USD',
                  crossCurrencyComparable: offerData.crossCurrencyComparable ?? false,
                  availability: offerData.availability || 'in_stock',
                  isSample: offerData.isSample ?? false,
                  dataStatus: offerData.dataStatus || 'live',
                  lastStatus: 'ok',
                  lastSuccessAt: new Date(),
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
              );

              item.id = persistedProduct._id.toString();
              item.offers = [toOfferSummary(persistedOffer)];
              ebayItems.push(item);
            }
          } catch (persistErr) {
            console.warn('[search] Failed to persist eBay item:', persistErr.message);
          }
        }
        combined = ebayItems.concat(combined);
      }
    } catch (ebayErr) {
      console.warn('[search] eBay search error:', ebayErr.message);
    }
  }

  // 3. Query DummyJSON external catalog for discovery ONLY when explicitly requested or in test mode
  const shouldQueryDummyJson =
    providerFilter === 'dummyjson' ||
    providerFilter === 'sample' ||
    (process.env.NODE_ENV === 'test' && (providerFilter === 'all' || providerFilter === 'dummyjson'));

  if (shouldQueryDummyJson) {
    try {
      const dummyRes = await dummyjsonProvider.searchProducts(q, { limit: 12 });
      if (dummyRes && Array.isArray(dummyRes.products)) {
        let dummyItems = dummyRes.products;
        if (category && category !== 'all') {
          dummyItems = dummyItems.filter(
            (p) => p.category?.toLowerCase() === category.toLowerCase()
          );
        }

        // Persist external items to MongoDB so users can track them in watchlist and configure alerts
        for (const item of dummyItems) {
          try {
            const canonicalKey = item.canonicalKey || `dummyjson-${item.externalId}`;
            const persistedProduct = await Product.findOneAndUpdate(
              { canonicalKey },
              {
                title: item.title,
                brand: item.brand,
                model: item.model,
                variant: item.variant,
                category: item.category || 'general',
                description: item.description,
                imageUrl: item.imageUrl,
                sourceProvider: 'dummyjson',
                externalId: item.externalId,
                sourceUrl: item.sourceUrl,
                dataStatus: 'sample', // Explicitly keep sample data labeled as sample
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            // Persist associated offer
            const offerData = item.offers?.[0];
            if (offerData && persistedProduct) {
              const persistedOffer = await Offer.findOneAndUpdate(
                { provider: 'dummyjson', externalProductId: String(offerData.externalProductId) },
                {
                  productId: persistedProduct._id,
                  retailer: 'dummyjson',
                  title: offerData.title || item.title,
                  productUrl: offerData.productUrl || item.sourceUrl,
                  priceInPaise: offerData.priceInPaise,
                  originalPrice: offerData.originalPrice,
                  originalCurrency: offerData.originalCurrency,
                  currency: offerData.currency || 'INR',
                  availability: offerData.availability || 'in_stock',
                  isSample: true,
                  dataStatus: 'sample',
                  lastStatus: 'ok',
                  lastSuccessAt: new Date(),
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
              );

              // Replace ephemeral in-memory IDs with genuine persisted MongoDB ObjectIds
              item.id = persistedProduct._id.toString();
              item.offers = [toOfferSummary(persistedOffer)];
            }
          } catch (persistErr) {
            console.warn('[search] Failed to persist DummyJSON item:', persistErr.message);
          }
        }

        combined = combined.concat(dummyItems);
      }
    } catch (err) {
      console.warn('[search] DummyJSON discovery error:', err.message);
    }
  }

  // 4. Query mock.shop optional storefront if requested or matching apparel
  if (providerFilter === 'mockshop') {
    try {
      const mockRes = await mockshopProvider.searchProducts(q, { limit: 6 });
      if (mockRes && Array.isArray(mockRes.products)) {
        for (const item of mockRes.products) {
          try {
            const canonicalKey = item.canonicalKey || `mockshop-${item.externalId}`;
            const persistedProduct = await Product.findOneAndUpdate(
              { canonicalKey },
              {
                title: item.title,
                brand: item.brand,
                model: item.model,
                variant: item.variant,
                category: item.category || 'apparel',
                description: item.description,
                imageUrl: item.imageUrl,
                sourceProvider: 'mockshop',
                externalId: item.externalId,
                sourceUrl: item.sourceUrl,
                dataStatus: 'sample',
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            const offerData = item.offers?.[0];
            if (offerData && persistedProduct) {
              const persistedOffer = await Offer.findOneAndUpdate(
                { provider: 'mockshop', externalProductId: String(offerData.externalProductId) },
                {
                  productId: persistedProduct._id,
                  retailer: 'mockshop',
                  title: offerData.title || item.title,
                  productUrl: offerData.productUrl || item.sourceUrl,
                  priceInPaise: offerData.priceInPaise,
                  originalPrice: offerData.originalPrice,
                  originalCurrency: offerData.originalCurrency,
                  currency: offerData.currency || 'INR',
                  availability: offerData.availability || 'in_stock',
                  isSample: true,
                  dataStatus: 'sample',
                  lastStatus: 'ok',
                  lastSuccessAt: new Date(),
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
              );

              item.id = persistedProduct._id.toString();
              item.offers = [toOfferSummary(persistedOffer)];
            }
          } catch (persistErr) {
            console.warn('[search] Failed to persist mock.shop item:', persistErr.message);
          }
        }
        combined = combined.concat(mockRes.products);
      }
    } catch (err) {
      console.warn('[search] mock.shop error:', err.message);
    }
  }

  // 5. Similar / Alternative products fallback when 0 exact products are found
  let alternatives = [];
  if (combined.length === 0 && (q || category)) {
    try {
      const altCatRegex = category && CATEGORY_MAP[category.toLowerCase()]
        ? CATEGORY_MAP[category.toLowerCase()]
        : /electronics|smartphone|laptop|audio|headphones/i;

      const altProducts = await Product.find({
        $or: [{ category: altCatRegex }, { title: altCatRegex }],
      }).limit(6);

      const altIds = altProducts.map((p) => p._id);
      const altOffers = await Offer.find({ productId: { $in: altIds } });
      const altOffersMap = new Map();
      for (const o of altOffers) {
        const k = o.productId.toString();
        if (!altOffersMap.has(k)) altOffersMap.set(k, []);
        altOffersMap.get(k).push(toOfferSummary(o));
      }

      alternatives = altProducts.map((p) => ({
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
        isAlternative: true,
        offers: altOffersMap.get(p._id.toString()) ?? [],
      }));
    } catch (_) {}
  }

  return res.status(200).json({
    success: true,
    data: {
      products: combined,
      alternatives,
    },
  });
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

export const getAutocomplete = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q || q.length < 2) {
    return res.status(200).json({ success: true, data: { suggestions: [] } });
  }

  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const products = await Product.find({
    $or: [{ title: regex }, { brand: regex }, { model: regex }],
  })
    .limit(8)
    .select('_id title brand model category imageUrl sourceProvider');

  const productIds = products.map((p) => p._id);
  const offers = await Offer.find({ productId: { $in: productIds } }).select('productId priceInPaise');
  const priceMap = new Map();
  for (const o of offers) {
    const key = o.productId.toString();
    if (!priceMap.has(key) || o.priceInPaise < priceMap.get(key)) {
      priceMap.set(key, o.priceInPaise);
    }
  }

  const suggestions = products.map((p) => ({
    id: p._id.toString(),
    title: p.title,
    brand: p.brand || null,
    category: p.category || 'electronics',
    imageUrl: p.imageUrl || null,
    minPriceInPaise: priceMap.get(p._id.toString()) || null,
  }));

  return res.status(200).json({ success: true, data: { suggestions } });
});

export const getCategories = asyncHandler(async (req, res) => {
  const coreCategories = ['audio', 'cameras', 'electronics', 'laptops', 'smartphones', 'wearables'];

  return res.status(200).json({
    success: true,
    data: { categories: coreCategories },
  });
});

export const getProviderStatus = asyncHandler(async (req, res) => {
  const ebayConfigured = ebayProvider.isConfigured();
  const apifyConfig = apifyProvider.getApifyConfig();

  const providers = [
    {
      id: 'apify',
      name: 'Apify Data Platform (Amazon, Flipkart, Meesho)',
      type: 'live',
      status: apifyConfig.isConfigured ? 'active' : 'unconfigured',
      description: 'Primary cloud data extraction platform retrieving genuine live e-commerce listings.',
      requiresAuth: true,
      isConfigured: apifyConfig.isConfigured,
      actors: ['amazon', 'flipkart', 'meesho'],
    },
    {
      id: 'ebay',
      name: 'eBay Browse API',
      type: 'live',
      status: ebayConfigured ? 'configured' : 'unconfigured',
      description: 'Official eBay Marketplace Browse API (OAuth 2.0 application client credentials required).',
      requiresAuth: true,
      isConfigured: ebayConfigured,
    },
    {
      id: 'fixture',
      name: 'Fixture Dataset',
      type: 'sample',
      status: 'active',
      description: 'Deterministic multi-retailer test fixtures isolated for automated testing.',
      requiresAuth: false,
      isConfigured: true,
    },
    {
      id: 'dummyjson',
      name: 'DummyJSON Catalog',
      type: 'sample',
      status: 'active',
      description: 'Secondary sample catalog isolated from production live search and categories.',
      requiresAuth: false,
      isConfigured: true,
      mode: 'isolated_sample',
    },
    {
      id: 'mockshop',
      name: 'Shopify mock.shop',
      type: 'sample',
      status: 'active',
      description: 'Fictional headless storefront isolated from production live search.',
      requiresAuth: false,
      isConfigured: true,
      mode: 'isolated_sample',
    },
    {
      id: 'flipkart',
      name: 'Flipkart Affiliate API (Legacy)',
      type: 'live',
      status: 'standby',
      description: 'Official retailer feed adapter (routed to fixture fallback until verified).',
      requiresAuth: true,
      isConfigured: Boolean(process.env.FLIPKART_AFFILIATE_ID && process.env.FLIPKART_AFFILIATE_TOKEN),
    },
    {
      id: 'amazon',
      name: 'Amazon India (Legacy Mock)',
      type: 'sample',
      status: 'mock_only',
      description: 'Compliance policy mock; live Amazon queries are routed via Apify.',
      requiresAuth: false,
      isConfigured: true,
    },
    {
      id: 'scrapling',
      name: 'Scrapling Worker (Testbed)',
      type: 'live',
      status: 'standby',
      description: 'Isolated Python Scrapling worker for authorized domain extraction with SSRF protection.',
      requiresAuth: false,
      isConfigured: Boolean(process.env.SCRAPLING_WORKER_URL),
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
  getAutocomplete,
  getProviderStatus,
};
