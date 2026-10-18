// server/src/providers/apify.js
// Primary external data collection adapter using Apify platform.
// Orchestrates real product discovery, listing extraction, and targeted
// single-item price monitoring across Indian e-commerce platforms.

import axios from 'axios';
import '../config/env.js';

const APIFY_API_BASE = 'https://api.apify.com/v2';

/**
 * Returns the current Apify environment configuration.
 */
export function getApifyConfig() {
  const token = (process.env.APIFY_API_TOKEN || '').trim();
  const actorAmazon = (process.env.APIFY_ACTOR_AMAZON || 'junglee/free-amazon-product-scraper').trim();
  const actorFlipkart = (process.env.APIFY_ACTOR_FLIPKART || 'shahidirfan/Flipkart-Product-Scraper').trim();
  const actorMeesho = (process.env.APIFY_ACTOR_MEESHO || 'scrapeai/meesho-product-scraper').trim();
  const maxItems = parseInt(process.env.APIFY_MAX_ITEMS || '5', 10);
  const timeoutSecs = parseInt(process.env.APIFY_TIMEOUT_SECS || '60', 10);

  return {
    token,
    isConfigured: Boolean(token),
    actorAmazon,
    actorFlipkart,
    actorMeesho,
    maxItems: Number.isInteger(maxItems) && maxItems > 0 ? maxItems : 5,
    timeoutSecs: Number.isInteger(timeoutSecs) && timeoutSecs > 0 ? timeoutSecs : 60,
  };
}

/**
 * Formats an actor ID for Apify REST API v2 URL (converts '/' to '~').
 * E.g., 'junglee/free-amazon-product-scraper' -> 'junglee~free-amazon-product-scraper'
 */
export function formatActorIdForApi(actorId) {
  if (!actorId) return '';
  return actorId.replace('/', '~');
}

/**
 * Robustly parses a price into integer paise (rupees * 100).
 * Strips currency symbols (₹, Rs, Rs., $), commas, and spaces.
 * Strictly returns null if value is <= 0, NaN, or unparseable.
 * Never returns 0 paise.
 */
export function parsePriceToPaise(rawPrice, currency = 'INR') {
  if (rawPrice === null || rawPrice === undefined || rawPrice === '') {
    return null;
  }

  let numVal;

  if (typeof rawPrice === 'object') {
    const val = rawPrice.value ?? rawPrice.amount ?? rawPrice.price;
    return parsePriceToPaise(val, rawPrice.currency || currency);
  }

  if (typeof rawPrice === 'number') {
    numVal = rawPrice;
  } else if (typeof rawPrice === 'string') {
    // Reject negative price strings immediately
    if (rawPrice.includes('-')) {
      return null;
    }

    // Clean string: remove ₹, $, Rs, Rs., currency codes, commas, and whitespace
    let cleaned = rawPrice
      .replace(/[₹\u20B9$]/g, '')
      .replace(/(?:rs\.?|inr|usd|eur)\s*/gi, '')
      .replace(/,/g, '')
      .replace(/[^\d.]/g, '')
      .trim();

    if (!cleaned || cleaned === '.') {
      return null;
    }

    numVal = parseFloat(cleaned);
  } else {
    return null;
  }

  if (isNaN(numVal) || !isFinite(numVal) || numVal <= 0) {
    return null;
  }

  // Multiply by 100 and round to nearest integer paise
  return Math.round(numVal * 100);
}

/**
 * Normalizes a raw dataset item returned from an Apify Actor.
 * Handles Amazon, Flipkart, and Meesho schema variances defensively.
 */
export function normalizeApifyItem(raw, retailer = 'amazon') {
  if (!raw || typeof raw !== 'object') return null;

  // 1. External ID extraction
  const externalId =
    raw.asin ||
    raw.productId ||
    raw.id ||
    raw.itemId ||
    (raw.url ? extractIdFromUrl(raw.url) : null);

  if (!externalId) return null;

  // 2. Title extraction
  const title = (raw.title || raw.name || '').trim();
  if (!title) return null;

  // 3. Selling price extraction (prioritize discounted / current price)
  const rawPrice =
    raw.price?.value ??
    raw.price?.amount ??
    raw.discountedPrice ??
    raw.currentPrice ??
    raw.sellingPrice ??
    raw.price;

  const currency = raw.price?.currency || raw.currency || 'INR';
  const priceInPaise = parsePriceToPaise(rawPrice, currency);
  if (priceInPaise === null || priceInPaise <= 0) return null;

  // 4. Original / List Price (optional MRP, strike price, or getPriceBeforeDiscount)
  const rawOriginalPrice =
    raw.getPriceBeforeDiscount?.value ??
    raw.originalPrice?.value ??
    raw.originalPrice ??
    raw.original_price ??
    raw.mrp ??
    raw.listPrice ??
    raw.strikePrice ??
    (raw.discountedPrice ? raw.price : null);
  const originalPriceInPaise = rawOriginalPrice
    ? parsePriceToPaise(rawOriginalPrice, currency)
    : null;

  // 5. Product URL
  let productUrl = raw.url || raw.productUrl || raw.product_url || raw.link || '';
  if (!productUrl && retailer === 'amazon' && raw.asin) {
    productUrl = `https://www.amazon.in/dp/${raw.asin}`;
  }

  // 6. Thumbnail Image
  const imageUrl =
    raw.imageUrl ||
    raw.image_url ||
    raw.thumbnailImage ||
    raw.image ||
    raw.mainImage ||
    (Array.isArray(raw.images) && raw.images.length > 0 ? raw.images[0] : null) ||
    null;

  // 7. Stock availability
  const availability =
    raw.inStock === false ||
    raw.availability === 'out_of_stock' ||
    raw.in_stock === false ||
    raw.is_available === false ||
    (typeof raw.availability_status === 'string' && raw.availability_status.toLowerCase().includes('out'))
      ? 'out_of_stock'
      : 'in_stock';

  return {
    externalId: String(externalId),
    title,
    retailer,
    priceInPaise,
    originalPrice: originalPriceInPaise ? originalPriceInPaise / 100 : priceInPaise / 100,
    originalCurrency: currency,
    currency: 'INR',
    productUrl,
    imageUrl,
    availability,
    brand: raw.brand || raw.manufacturer || null,
    model: raw.model || null,
    category: raw.category || raw.department || 'general',
    description: raw.description || (Array.isArray(raw.features) ? raw.features.join(' ') : ''),
    isSample: false,
    dataStatus: 'live',
  };
}

/**
 * Extracts a fallback identifier from a retailer URL.
 */
function extractIdFromUrl(url) {
  try {
    const parsed = new URL(url);
    // Amazon /dp/B0...
    const amazonMatch = parsed.pathname.match(/\/dp\/([A-Z0-9]{10})/i);
    if (amazonMatch) return amazonMatch[1];

    // Flipkart /p/itm...
    const flipkartMatch = parsed.pathname.match(/\/p\/(itm[a-z0-9]+)/i);
    if (flipkartMatch) return flipkartMatch[1];

    // Last path segment
    const segments = parsed.pathname.split('/').filter(Boolean);
    return segments[segments.length - 1] || null;
  } catch {
    return null;
  }
}

/**
 * Verifies the Apify API token against GET https://api.apify.com/v2/users/me.
 * Returns account details or descriptive error.
 */
export async function verifyToken(tokenOverride) {
  const config = getApifyConfig();
  const token = tokenOverride || config.token;

  if (!token) {
    return {
      configured: false,
      valid: false,
      errorMessage: 'APIFY_API_TOKEN is not set in server/.env.',
    };
  }

  try {
    const res = await axios.get(`${APIFY_API_BASE}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000,
    });

    const userData = res.data?.data || {};
    return {
      configured: true,
      valid: true,
      userId: userData.id,
      username: userData.username,
      email: userData.email,
      plan: userData.plan?.name || userData.plan?.id || 'Free',
    };
  } catch (err) {
    if (err.response?.status === 401) {
      return {
        configured: true,
        valid: false,
        errorMessage: 'Invalid Apify API token (HTTP 401 Unauthorized). Please check your token at https://console.apify.com/account/integrations.',
      };
    }
    return {
      configured: true,
      valid: false,
      errorMessage: `Failed to verify Apify token: ${err.message}`,
    };
  }
}

/**
 * Builds Actor input payload based on retailer and query/target.
 */
export function buildActorInput(retailer, query, options = {}) {
  const limit = options.limit || 5;

  if (retailer === 'amazon') {
    const searchUrl = options.isUrl
      ? query
      : `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;

    return {
      categoryUrls: [{ url: searchUrl }],
      maxItemsPerStartUrl: limit,
      scrapeProductDetails: Boolean(options.isUrl),
    };
  }

  if (retailer === 'flipkart') {
    if (options.isUrl) {
      return {
        startUrl: query,
        results_wanted: 1,
      };
    }
    return {
      keyword: query,
      results_wanted: limit,
    };
  }

  if (retailer === 'meesho') {
    if (options.isUrl) {
      return {
        startUrls: [{ url: query }],
        maxItems: 1,
      };
    }
    return {
      mode: 'search',
      search: query,
      maxItems: limit,
    };
  }

  // Default fallback
  return {
    search: query,
    maxItems: limit,
  };
}

/**
 * Executes an Actor synchronously and retrieves the dataset items.
 * Uses POST /v2/actors/{actorId}/run-sync-get-dataset-items
 *
 * @param {string} actorId - E.g. 'junglee/free-amazon-product-scraper'
 * @param {object} input - Input payload
 * @param {object} options - Timeout and token options
 * @returns {Promise<Array>} Array of dataset items
 */
export async function runActorSync(actorId, input, options = {}) {
  const config = getApifyConfig();
  const token = options.token || config.token;

  if (!token) {
    throw new Error('APIFY_API_TOKEN is not configured.');
  }

  const apiActorId = formatActorIdForApi(actorId);
  const timeout = options.timeoutSecs || config.timeoutSecs;

  const url = `${APIFY_API_BASE}/actors/${apiActorId}/run-sync-get-dataset-items?format=json&clean=true&timeout=${timeout}`;

  const res = await axios.post(url, input, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    timeout: (timeout + 10) * 1000, // Client socket timeout slightly larger than Actor timeout
  });

  return Array.isArray(res.data) ? res.data : [];
}

/**
 * Searches for live products using configured Apify Actor.
 * Primary source defaults to Amazon India, expandable to Flipkart and Meesho.
 *
 * @param {string} query - Keyword search term
 * @param {object} options - { retailer, limit }
 * @returns {Promise<{ products: Array, retailer: string, total: number }>}
 */
export async function searchProducts(query, options = {}) {
  const config = getApifyConfig();
  if (!config.isConfigured) {
    return {
      products: [],
      retailer: options.retailer || 'amazon',
      total: 0,
      configured: false,
      message: 'Apify API token not configured.',
    };
  }

  const retailer = (options.retailer || 'amazon').toLowerCase();
  const limit = Math.min(options.limit || config.maxItems, 10);

  let actorId = config.actorAmazon;
  if (retailer === 'flipkart') actorId = config.actorFlipkart;
  if (retailer === 'meesho') actorId = config.actorMeesho;

  const input = buildActorInput(retailer, query, { limit });

  try {
    const rawItems = await runActorSync(actorId, input, {
      timeoutSecs: config.timeoutSecs,
    });

    const normalizedProducts = [];

    for (const raw of rawItems) {
      const normalized = normalizeApifyItem(raw, retailer);
      if (!normalized) continue;

      const canonicalKey = `apify-${retailer}-${normalized.externalId}`.toLowerCase();

      normalizedProducts.push({
        id: canonicalKey, // Ephemeral placeholder replaced upon MongoDB upsert
        canonicalKey,
        title: normalized.title,
        brand: normalized.brand,
        model: normalized.model,
        variant: null,
        category: normalized.category,
        description: normalized.description,
        imageUrl: normalized.imageUrl,
        sourceProvider: 'apify',
        externalId: normalized.externalId,
        sourceUrl: normalized.productUrl,
        dataStatus: 'live',
        isSample: false,
        offers: [
          {
            provider: 'apify',
            externalProductId: `${retailer}-${normalized.externalId}`,
            title: normalized.title,
            priceInPaise: normalized.priceInPaise,
            originalPrice: normalized.originalPrice,
            originalCurrency: normalized.originalCurrency,
            currency: 'INR',
            availability: normalized.availability,
            productUrl: normalized.productUrl,
            isSample: false,
            dataStatus: 'live',
            retailer,
          },
        ],
      });
    }

    return {
      products: normalizedProducts,
      retailer,
      total: normalizedProducts.length,
      configured: true,
    };
  } catch (err) {
    console.error(`[apify] Search failed for retailer=${retailer} query="${query}":`, err.message);
    return {
      products: [],
      retailer,
      total: 0,
      configured: true,
      error: err.message,
    };
  }
}

/**
 * Refreshes a single tracked offer from Apify during scheduled monitoring.
 * Performs a targeted single-listing scrape to minimize compute usage and cost.
 *
 * @param {object} offer - { externalProductId, productUrl, priceInPaise, ... }
 * @returns {Promise<object>} Normalized result matching provider dispatcher contract
 */
export async function fetchOffer(offer) {
  const config = getApifyConfig();
  if (!config.isConfigured) {
    return {
      provider: 'apify',
      externalProductId: offer.externalProductId,
      success: false,
      errorMessage: 'Apify API token not configured in server/.env.',
    };
  }

  // Determine retailer from externalProductId (e.g. 'amazon-B09X7MPX8L' -> 'amazon')
  let retailer = 'amazon';
  let cleanId = offer.externalProductId || '';

  if (offer.externalProductId?.startsWith('flipkart-')) {
    retailer = 'flipkart';
    cleanId = offer.externalProductId.replace(/^flipkart-/, '');
  } else if (offer.externalProductId?.startsWith('meesho-')) {
    retailer = 'meesho';
    cleanId = offer.externalProductId.replace(/^meesho-/, '');
  } else if (offer.externalProductId?.startsWith('amazon-')) {
    retailer = 'amazon';
    cleanId = offer.externalProductId.replace(/^amazon-/, '');
  }

  let actorId = config.actorAmazon;
  if (retailer === 'flipkart') actorId = config.actorFlipkart;
  if (retailer === 'meesho') actorId = config.actorMeesho;

  const targetUrl = offer.productUrl || (retailer === 'amazon' ? `https://www.amazon.in/dp/${cleanId}` : null);
  if (!targetUrl) {
    return {
      provider: 'apify',
      externalProductId: offer.externalProductId,
      success: false,
      errorMessage: 'Missing product URL for targeted single-item refresh.',
    };
  }

  const input = buildActorInput(retailer, targetUrl, { isUrl: true, limit: 1 });

  try {
    const rawItems = await runActorSync(actorId, input, {
      timeoutSecs: config.timeoutSecs,
    });

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return {
        provider: 'apify',
        externalProductId: offer.externalProductId,
        success: false,
        errorMessage: 'Apify Actor returned empty dataset for listing.',
      };
    }

    // Match the specific item corresponding to the tracked listing
    const getRawListingId = (raw) => {
      if (!raw || typeof raw !== 'object') return null;
      return (
        raw.asin ||
        raw.productId ||
        raw.id ||
        raw.itemId ||
        (raw.url ? extractIdFromUrl(raw.url) : null)
      );
    };

    let matchedRaw = null;

    if (cleanId) {
      matchedRaw = rawItems.find((raw) => {
        const rawId = getRawListingId(raw);
        return rawId && rawId.toLowerCase() === cleanId.toLowerCase();
      });
    }

    if (!matchedRaw && offer.productUrl) {
      matchedRaw = rawItems.find((raw) => {
        const rawUrl = raw.url || raw.productUrl;
        return rawUrl && rawUrl.toLowerCase() === offer.productUrl.toLowerCase();
      });
    }

    // Fall back to first item only if targeted single-item URL was requested and rawItems contains 1 result
    if (!matchedRaw && rawItems.length === 1) {
      const singleId = getRawListingId(rawItems[0]);
      if (!cleanId || !singleId || singleId.toLowerCase() === cleanId.toLowerCase()) {
        matchedRaw = rawItems[0];
      }
    }

    if (!matchedRaw) {
      return {
        provider: 'apify',
        externalProductId: offer.externalProductId,
        success: false,
        errorMessage: `Listing mismatch: Apify returned items that do not match tracked ID "${cleanId}".`,
      };
    }

    const normalized = normalizeApifyItem(matchedRaw, retailer);
    if (!normalized || !normalized.priceInPaise || normalized.priceInPaise <= 0) {
      return {
        provider: 'apify',
        externalProductId: offer.externalProductId,
        success: false,
        errorMessage: 'Failed to extract valid positive price from Apify listing.',
      };
    }

    return {
      provider: 'apify',
      externalProductId: offer.externalProductId,
      success: true,
      priceInPaise: normalized.priceInPaise,
      availability: normalized.availability,
      title: normalized.title,
      productUrl: normalized.productUrl || offer.productUrl,
      dataStatus: 'live',
      isSample: false,
    };
  } catch (err) {
    return {
      provider: 'apify',
      externalProductId: offer.externalProductId,
      success: false,
      errorMessage: err.message,
    };
  }
}

export default {
  getApifyConfig,
  formatActorIdForApi,
  parsePriceToPaise,
  normalizeApifyItem,
  verifyToken,
  buildActorInput,
  runActorSync,
  searchProducts,
  fetchOffer,
};
