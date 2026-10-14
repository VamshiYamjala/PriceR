// server/src/providers/dummyjson.js
// Primary free sample catalog provider adapter (Document prompt Section 3)
// Fetches external product catalog data from DummyJSON, normalizes fields,
// enforces dataStatus: "sample", and caches public queries with TTL.

import axios from 'axios';

const DUMMYJSON_BASE_URL = process.env.DUMMYJSON_BASE_URL || 'https://dummyjson.com';
const TIMEOUT_MS = 5000;
const USD_TO_INR = 83; // Fixed conversion rate documented for sample currency normalization

// Bounded in-memory cache to prevent downloading or re-requesting repeatedly
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data, ttlMs = CACHE_TTL_MS) {
  // Bound max cache items to avoid memory bloat
  if (cache.size > 200) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function clearCacheForTesting() {
  cache.clear();
}

const httpClient = axios.create({
  baseURL: DUMMYJSON_BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
});

/**
 * Normalizes a raw DummyJSON item into PriceRadar's canonical product & offer structure.
 */
export function normalizeDummyJsonProduct(item) {
  if (!item || !item.id) return null;

  const usdPrice = typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0;
  // Convert USD to integer paise: $9.99 * 83 INR/USD * 100 paise = 82917 paise
  const priceInPaise = Math.round(usdPrice * USD_TO_INR * 100);

  const availability =
    item.stock === 0 || item.availabilityStatus === 'Out of Stock'
      ? 'out_of_stock'
      : 'in_stock';

  const imageUrl = item.thumbnail || (Array.isArray(item.images) && item.images[0]) || null;

  return {
    id: `dummyjson-${item.id}`,
    externalId: String(item.id),
    title: item.title || 'Untitled Product',
    brand: item.brand || null,
    model: item.sku || null,
    variant: null,
    category: item.category || 'general',
    description: item.description || '',
    imageUrl,
    images: Array.isArray(item.images) ? item.images : (imageUrl ? [imageUrl] : []),
    canonicalKey: `dummyjson-${item.id}`,
    sourceProvider: 'dummyjson',
    sourceUrl: `https://dummyjson.com/products/${item.id}`,
    dataStatus: 'sample',
    offers: [
      {
        id: `dummyjson-offer-${item.id}`,
        provider: 'dummyjson',
        externalProductId: String(item.id),
        title: item.title || 'Untitled Product',
        productUrl: `https://dummyjson.com/products/${item.id}`,
        priceInPaise,
        originalPrice: usdPrice,
        originalCurrency: 'USD',
        currency: 'INR',
        availability,
        isSample: true,
        dataStatus: 'sample',
        lastStatus: 'ok',
        lastSuccessAt: new Date().toISOString(),
      },
    ],
  };
}

/**
 * Searches DummyJSON catalog by query with bounded limits and caching.
 * @param {string} query
 * @param {object} options - { limit, skip }
 */
export async function searchProducts(query, { limit = 20, skip = 0 } = {}) {
  const cleanQ = (query || '').trim();
  const safeLimit = Math.min(Math.max(1, Number(limit) || 20), 50);
  const safeSkip = Math.max(0, Number(skip) || 0);

  const cacheKey = `search:${cleanQ.toLowerCase()}:${safeLimit}:${safeSkip}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const url = cleanQ
      ? `/products/search?q=${encodeURIComponent(cleanQ)}&limit=${safeLimit}&skip=${safeSkip}`
      : `/products?limit=${safeLimit}&skip=${safeSkip}`;

    const response = await httpClient.get(url);
    const rawProducts = response.data?.products || [];
    const total = response.data?.total || 0;

    const normalized = rawProducts
      .map(normalizeDummyJsonProduct)
      .filter(Boolean);

    const result = {
      provider: 'dummyjson',
      dataStatus: 'sample',
      total,
      limit: safeLimit,
      skip: safeSkip,
      products: normalized,
      success: true,
      error: null,
    };

    setCached(cacheKey, result);
    return result;
  } catch (err) {
    return {
      provider: 'dummyjson',
      dataStatus: 'sample',
      total: 0,
      limit: safeLimit,
      skip: safeSkip,
      products: [],
      success: false,
      error: err.response?.data?.message || err.message || 'DummyJSON request failed',
    };
  }
}

/**
 * Fetches a single product by its DummyJSON ID.
 */
export async function getProductById(id) {
  const cleanId = String(id).replace(/^dummyjson-/, '').trim();
  if (!cleanId) return null;

  const cacheKey = `product:${cleanId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await httpClient.get(`/products/${cleanId}`);
    const normalized = normalizeDummyJsonProduct(response.data);
    if (normalized) {
      setCached(cacheKey, normalized);
    }
    return normalized;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

/**
 * Fetches the list of categories from DummyJSON.
 */
export async function getCategories() {
  const cacheKey = 'categories';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await httpClient.get('/products/category-list');
    const categories = Array.isArray(response.data) ? response.data : [];
    setCached(cacheKey, categories, 60 * 60 * 1000); // 1 hour cache
    return categories;
  } catch (err) {
    return [];
  }
}

/**
 * Adapter method called by providers/index.js dispatcher for monitoring/fetching an individual offer.
 */
export async function fetchOffer(offer) {
  const cleanId = String(offer.externalProductId).replace(/^dummyjson-/, '').trim();
  try {
    const response = await httpClient.get(`/products/${cleanId}`);
    const data = response.data;
    const usdPrice = typeof data.price === 'number' && !isNaN(data.price) ? data.price : 0;
    const priceInPaise = Math.round(usdPrice * USD_TO_INR * 100);
    const availability =
      data.stock === 0 || data.availabilityStatus === 'Out of Stock'
        ? 'out_of_stock'
        : 'in_stock';

    return {
      provider: 'dummyjson',
      externalProductId: String(data.id),
      title: data.title,
      brand: data.brand || null,
      model: data.sku || null,
      variant: null,
      priceInPaise,
      originalPrice: usdPrice,
      originalCurrency: 'USD',
      currency: 'INR',
      availability,
      productUrl: `https://dummyjson.com/products/${data.id}`,
      imageUrl: data.thumbnail || (Array.isArray(data.images) && data.images[0]) || null,
      isSample: true,
      dataStatus: 'sample',
      success: true,
      errorMessage: null,
    };
  } catch (err) {
    return {
      provider: 'dummyjson',
      externalProductId: offer.externalProductId,
      success: false,
      isSample: true,
      dataStatus: 'sample',
      errorMessage: err.response?.data?.message || err.message || 'DummyJSON fetch failed',
    };
  }
}

export default {
  searchProducts,
  getProductById,
  getCategories,
  fetchOffer,
  normalizeDummyJsonProduct,
  clearCacheForTesting,
};
