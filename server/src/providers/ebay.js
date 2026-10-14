// server/src/providers/ebay.js
// Genuine marketplace provider adapter for eBay Browse API (Prompt Section 6 & 8)
// Uses OAuth 2.0 Application Client Credentials grant.
// Stays safely disabled and unconfigured unless EBAY_CLIENT_ID and EBAY_CLIENT_SECRET are provided.

import axios from 'axios';

const EBAY_ENV = process.env.EBAY_ENV || 'production'; // 'sandbox' or 'production'
const AUTH_URL =
  EBAY_ENV === 'sandbox'
    ? 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
    : 'https://api.ebay.com/identity/v1/oauth2/token';

const API_BASE_URL =
  EBAY_ENV === 'sandbox'
    ? 'https://api.sandbox.ebay.com/buy/browse/v1'
    : 'https://api.ebay.com/buy/browse/v1';

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Checks whether eBay credentials are configured in the environment.
 */
export function isConfigured() {
  return Boolean(process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET);
}

/**
 * Obtains an application access token using client credentials grant.
 * Never throws — returns null if credentials missing or exchange fails.
 */
export async function getAccessToken() {
  if (!isConfigured()) return null;

  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  try {
    const creds = Buffer.from(
      `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
    ).toString('base64');

    const res = await axios.post(
      AUTH_URL,
      'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
      {
        headers: {
          Authorization: `Basic ${creds}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 5000,
      }
    );

    if (res.data?.access_token) {
      cachedToken = res.data.access_token;
      tokenExpiresAt = Date.now() + (res.data.expires_in || 7200) * 1000;
      return cachedToken;
    }
    return null;
  } catch (err) {
    console.warn('[ebay] OAuth token exchange failed:', err.response?.data?.error_description || err.message);
    return null;
  }
}

/**
 * Normalizes an eBay item summary into PriceRadar's format.
 */
export function normalizeEbayItem(item) {
  if (!item || !item.itemId) return null;

  const rawValue = parseFloat(item.price?.value || '0');
  const currency = item.price?.currency || 'USD';
  // If price is in INR, value * 100 paise; if in USD, 83 * 100 paise
  const rate = currency === 'INR' ? 1 : 83;
  const priceInPaise = Math.round(rawValue * rate * 100);

  return {
    id: `ebay-${item.itemId}`,
    externalId: item.itemId,
    title: item.title,
    brand: null,
    model: null,
    variant: null,
    category: item.categories?.[0]?.categoryName || 'marketplace',
    description: item.shortDescription || '',
    imageUrl: item.image?.imageUrl || null,
    canonicalKey: `ebay-${item.itemId}`,
    sourceProvider: 'ebay',
    sourceUrl: item.itemWebUrl || `https://www.ebay.com/itm/${item.itemId}`,
    dataStatus: 'live',
    offers: [
      {
        id: `ebay-offer-${item.itemId}`,
        provider: 'ebay',
        externalProductId: item.itemId,
        title: item.title,
        productUrl: item.itemWebUrl || `https://www.ebay.com/itm/${item.itemId}`,
        priceInPaise,
        originalPrice: rawValue,
        originalCurrency: currency,
        currency: 'INR',
        availability: 'in_stock',
        isSample: false, // Genuine live marketplace offer
        dataStatus: 'live',
        lastStatus: 'ok',
        lastSuccessAt: new Date().toISOString(),
      },
    ],
  };
}

/**
 * Searches eBay marketplace items. Returns empty results safely if credentials unconfigured.
 */
export async function searchProducts(query, { limit = 10 } = {}) {
  if (!isConfigured()) {
    return {
      provider: 'ebay',
      status: 'unconfigured',
      message: 'eBay API client credentials (EBAY_CLIENT_ID / EBAY_CLIENT_SECRET) not set in server/.env',
      products: [],
    };
  }

  const token = await getAccessToken();
  if (!token) {
    return {
      provider: 'ebay',
      status: 'auth_failed',
      message: 'Failed to obtain OAuth application token from eBay',
      products: [],
    };
  }

  try {
    const res = await axios.get(`${API_BASE_URL}/item_summary/search`, {
      params: { q: query, limit },
      headers: {
        Authorization: `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_IN', // Target Indian marketplace where available
      },
      timeout: 5000,
    });

    const items = (res.data?.itemSummaries || []).map(normalizeEbayItem).filter(Boolean);
    return {
      provider: 'ebay',
      status: 'active',
      products: items,
    };
  } catch (err) {
    return {
      provider: 'ebay',
      status: 'error',
      message: err.response?.data?.errors?.[0]?.message || err.message,
      products: [],
    };
  }
}

export default {
  isConfigured,
  getAccessToken,
  searchProducts,
  normalizeEbayItem,
};
