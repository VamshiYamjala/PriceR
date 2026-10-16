// server/src/controllers/productsController.js
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Offer from '../models/Offer.js';
import { asyncHandler } from '../utils/asyncHandler.js';
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

/**
 * Searches products across active discovery sources (Apify & eBay) and stored MongoDB catalog.
 * DummyJSON and mock.shop have been removed from active product discovery.
 */
export const searchProducts = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  const category = (req.query.category || '').trim();
  const providerFilter = (req.query.provider || 'all').trim().toLowerCase();
  const retailerFilter = (req.query.retailer || '').trim().toLowerCase();

  // If query is completely empty and no category is requested, return empty list
  if (!q && !category) {
    return res.status(200).json({ success: true, data: { products: [], alternatives: [] } });
  }

  let dbProducts = [];

  // 1. Search local DB (stored and previously discovered products) if DB connected
  if (mongoose.connection.readyState === 1 && (providerFilter === 'all' || providerFilter === 'live' || providerFilter === 'fixture')) {
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

    if (retailerFilter && retailerFilter !== 'all') {
      // Find matching offer productIds if specific retailer requested
      const matchingOffers = await Offer.find({
        $or: [{ retailer: retailerFilter }, { provider: retailerFilter }],
      }).select('productId');
      const matchingProductIds = matchingOffers.map((o) => o.productId);
      dbQuery._id = { $in: matchingProductIds };
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
    sourceProvider: p.sourceProvider || 'live',
    dataStatus: p.dataStatus || 'live',
    canonicalKey: p.canonicalKey,
    offers: offersByProduct.get(p._id.toString()) ?? [],
  }));

  // Determine whether to execute live discovery via Apify and/or eBay
  const effectiveQuery = q || (category && category !== 'all' ? (
    category === 'audio' ? 'wireless headphones' :
    category === 'laptops' ? 'laptop' :
    category === 'cameras' ? 'camera' :
    category === 'smartphones' ? 'smartphone' : category
  ) : '');

  const hasSpecificRetailer = Boolean(retailerFilter && retailerFilter !== 'all');

  const shouldQueryApify =
    (!hasSpecificRetailer && (providerFilter === 'all' || providerFilter === 'live' || providerFilter === 'apify') && process.env.NODE_ENV !== 'test') ||
    (hasSpecificRetailer && ['amazon', 'flipkart', 'meesho'].includes(retailerFilter)) ||
    providerFilter === 'apify';

  const shouldQueryEbay =
    (!hasSpecificRetailer && (providerFilter === 'all' || providerFilter === 'live' || providerFilter === 'ebay') && process.env.NODE_ENV !== 'test') ||
    (hasSpecificRetailer && retailerFilter === 'ebay') ||
    providerFilter === 'ebay';

  if (effectiveQuery && Product.db?.readyState === 1) {
    const discoveryPromises = [];

    // 2. Apify Actor Discovery (Amazon India, Flipkart, Meesho)
    if (shouldQueryApify) {
      const apifyConfig = apifyProvider.getApifyConfig();
      if (apifyConfig.isConfigured) {
        let retailer = 'amazon';
        if (retailerFilter === 'flipkart' || providerFilter === 'flipkart') retailer = 'flipkart';
        else if (retailerFilter === 'meesho' || providerFilter === 'meesho') retailer = 'meesho';

        discoveryPromises.push(
          (async () => {
            try {
              const apifyRes = await apifyProvider.searchProducts(effectiveQuery, {
                retailer,
                limit: apifyConfig.maxItems || 6,
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
                        dataStatus: 'live',
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
                          crossCurrencyComparable: offerData.crossCurrencyComparable ?? (offerData.currency === 'INR'),
                          availability: offerData.availability || 'in_stock',
                          isSample: false,
                          dataStatus: 'live',
                          lastStatus: 'ok',
                          lastSuccessAt: new Date(),
                        },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                      );

                      item.id = persistedProduct._id.toString();
                      item.canonicalKey = canonicalKey;
                      item.offers = [toOfferSummary(persistedOffer)];
                      liveItems.push(item);
                    }
                  } catch (persistErr) {
                    console.warn('[search] Failed to persist Apify live item:', persistErr.message);
                  }
                }
                return liveItems;
              }
            } catch (err) {
              console.warn('[search] Apify live search error:', err.message);
            }
            return [];
          })()
        );
      }
    }

    // 3. eBay Browse API Discovery (Official eBay Marketplace)
    if (shouldQueryEbay && ebayProvider.isConfigured()) {
      discoveryPromises.push(
        (async () => {
          try {
            const ebayRes = await ebayProvider.searchProducts(effectiveQuery, { limit: 8 });
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
                    item.canonicalKey = canonicalKey;
                    item.offers = [toOfferSummary(persistedOffer)];
                    ebayItems.push(item);
                  }
                } catch (persistErr) {
                  console.warn('[search] Failed to persist eBay item:', persistErr.message);
                }
              }
              return ebayItems;
            }
          } catch (err) {
            console.warn('[search] eBay live search error:', err.message);
          }
          return [];
        })()
      );
    }

    if (discoveryPromises.length > 0) {
      const settledResults = await Promise.allSettled(discoveryPromises);
      const newlyDiscovered = [];

      for (const res of settledResults) {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          newlyDiscovered.push(...res.value);
        }
      }

      if (newlyDiscovered.length > 0) {
        // Prepend newly discovered items, avoiding duplicate canonical keys
        const seenKeys = new Set(newlyDiscovered.map((item) => item.canonicalKey || item.id));
        const filteredDb = combined.filter((item) => !seenKeys.has(item.canonicalKey || item.id));
        combined = newlyDiscovered.concat(filteredDb);
      }
    }
  }

  if (hasSpecificRetailer) {
    combined = combined.filter((item) =>
      item.sourceProvider === retailerFilter ||
      item.offers?.some((o) => o.retailer === retailerFilter || o.provider === retailerFilter)
    );
  }

  // 4. Similar / Alternative products fallback when 0 exact products are found
  let alternatives = [];
  if (mongoose.connection.readyState === 1 && combined.length === 0 && (q || category)) {
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
        sourceProvider: p.sourceProvider || 'live',
        dataStatus: p.dataStatus || 'live',
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

/**
 * Retrieves a single product by MongoDB _id or canonicalKey.
 * External sample catalog calls have been completely removed.
 */
export const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  let product = null;

  if (mongoose.connection.readyState === 1) {
    // 1. Try finding by ObjectId if valid
    if (mongoose.Types.ObjectId.isValid(productId)) {
      try {
        product = await Product.findById(productId);
      } catch (_) {}
    }

    // 2. Fallback to lookup by canonicalKey or externalId for persisted items
    if (!product) {
      try {
        product = await Product.findOne({
          $or: [
            { canonicalKey: productId.toLowerCase() },
            { externalId: productId },
          ],
        });
      } catch (_) {}
    }
  }

  if (!product) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Product not found.' },
    });
  }

  const offers = mongoose.connection.readyState === 1
    ? await Offer.find({ productId: product._id })
    : [];
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
        sourceProvider: product.sourceProvider || 'live',
        dataStatus: product.dataStatus || 'live',
      },
      offers: offers.map(toOfferSummary),
    },
  });
});

export const getAutocomplete = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q || q.length < 2 || mongoose.connection.readyState !== 1) {
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

/**
 * Reports status of product sources (Apify & eBay).
 * Sample dummy catalogs have been removed from active discovery.
 */
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
      description: 'Official eBay Marketplace Browse API (OAuth 2.0 application client credentials).',
      requiresAuth: true,
      isConfigured: ebayConfigured,
    },
    {
      id: 'fixture',
      name: 'Fixture Dataset (Automated Testing Only)',
      type: 'sample',
      status: 'active',
      description: 'Deterministic test fixtures strictly isolated for local automated testing suites.',
      requiresAuth: false,
      isConfigured: true,
      mode: 'test_only',
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
