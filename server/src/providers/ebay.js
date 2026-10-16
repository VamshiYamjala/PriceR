// server/src/providers/ebay.js
// Genuine marketplace provider adapter for eBay Browse API.
// Uses OAuth 2.0 Application Client Credentials grant.
// Stays safely disabled and unconfigured unless EBAY_CLIENT_ID and EBAY_CLIENT_SECRET are provided.

import axios from 'axios';

function getEnvConfig() {
  const env = (process.env.EBAY_ENV || 'production').toLowerCase();
  const isSandbox = env === 'sandbox';
  const clientId = process.env.EBAY_CLIENT_ID || '';
  const clientSecret = process.env.EBAY_CLIENT_SECRET || '';
  const marketplaceId = process.env.EBAY_MARKETPLACE_ID || (isSandbox ? 'EBAY_US' : 'EBAY_US');

  return {
    env,
    isSandbox,
    clientId,
    clientSecret,
    marketplaceId,
    authUrl: isSandbox
      ? 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
      : 'https://api.ebay.com/identity/v1/oauth2/token',
    apiBaseUrl: isSandbox
      ? 'https://api.sandbox.ebay.com/buy/browse/v1'
      : 'https://api.ebay.com/buy/browse/v1',
  };
}

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Checks whether eBay credentials are configured in the environment.
 */
export function isConfigured() {
  const { clientId, clientSecret } = getEnvConfig();
  return Boolean(clientId && clientSecret);
}

/**
 * Clear cached token for testing purposes.
 */
export function clearTokenCacheForTesting() {
  cachedToken = null;
  tokenExpiresAt = 0;
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

  const { clientId, clientSecret, authUrl } = getEnvConfig();

  try {
    const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const res = await axios.post(
      authUrl,
      'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
      {
        headers: {
          Authorization: `Basic ${creds}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 7000,
      }
    );

    if (res.data?.access_token) {
      cachedToken = res.data.access_token;
      tokenExpiresAt = Date.now() + (res.data.expires_in || 7200) * 1000;
      return cachedToken;
    }
    return null;
  } catch (err) {
    const detail = err.response?.data?.error_description || err.response?.data?.error || err.message;
    console.warn('[ebay] OAuth token exchange failed:', detail);
    return null;
  }
}

/**
 * Validates and normalizes an eBay item summary into PriceRadar's format.
 *
 * NOTE on Currency & Price Precision:
 * Unsafe fixed-rate conversions (e.g. 1 USD = 83 INR) are strictly removed.
 * Original currency and original price are preserved.
 * If the item is already in INR, priceInPaise = Math.round(rawValue * 100).
 * If the item is in foreign currency (e.g. USD, GBP, EUR), priceInPaise stores
 * the integer minor currency units (cents/pence) with currency set explicitly,
 * preventing cross-currency comparison collisions against INR listings.
 */
export function normalizeEbayItem(item) {
  if (!item || !item.itemId) return null;

  // Title validation
  const rawTitle = typeof item.title === 'string' ? item.title.trim() : '';
  if (!rawTitle) return null;

  // Price validation
  const rawValue = parseFloat(item.price?.value);
  if (isNaN(rawValue) || rawValue <= 0 || !isFinite(rawValue)) {
    return null;
  }

  const rawCurrency = (item.price?.currency || 'USD').toUpperCase();
  const { isSandbox, marketplaceId } = getEnvConfig();

  // Determine minor currency unit (cents or paise) as an integer
  const priceInMinorUnits = Math.round(rawValue * 100);

  // Listing direct URL validation
  const productUrl =
    typeof item.itemWebUrl === 'string' && item.itemWebUrl.startsWith('http')
      ? item.itemWebUrl
      : `https://www.ebay.com/itm/${encodeURIComponent(item.itemId)}`;

  const isSample = isSandbox;
  const dataStatus = isSandbox ? 'sample' : 'live';

  return {
    id: `ebay-${item.itemId}`,
    externalId: String(item.itemId),
    title: rawTitle,
    brand: null,
    model: null,
    variant: null,
    category: item.categories?.[0]?.categoryName || 'marketplace',
    description: item.shortDescription || '',
    imageUrl: item.image?.imageUrl || (Array.isArray(item.additionalImages) ? item.additionalImages[0]?.imageUrl : null),
    canonicalKey: `ebay-${item.itemId}`.toLowerCase(),
    sourceProvider: 'ebay',
    sourceUrl: productUrl,
    dataStatus,
    marketplace: marketplaceId,
    offers: [
      {
        id: `ebay-offer-${item.itemId}`,
        provider: 'ebay',
        retailer: 'ebay',
        externalProductId: String(item.itemId),
        title: rawTitle,
        productUrl,
        priceInPaise: priceInMinorUnits,
        originalPrice: rawValue,
        originalCurrency: rawCurrency,
        currency: rawCurrency,
        crossCurrencyComparable: rawCurrency === 'INR',
        availability: 'in_stock',
        isSample,
        dataStatus,
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
  const { apiBaseUrl, marketplaceId } = getEnvConfig();

  if (!isConfigured()) {
    return {
      provider: 'ebay',
      status: 'unconfigured',
      message: 'eBay API client credentials (EBAY_CLIENT_ID / EBAY_CLIENT_SECRET) not configured in server/.env',
      products: [],
    };
  }

  const token = await getAccessToken();
  if (!token) {
    return {
      provider: 'ebay',
      status: 'auth_failed',
      message: 'Failed to obtain OAuth application token from eBay. Verify EBAY_CLIENT_ID and EBAY_CLIENT_SECRET.',
      products: [],
    };
  }

  try {
    const res = await axios.get(`${apiBaseUrl}/item_summary/search`, {
      params: {
        q: query,
        limit: Math.min(Math.max(1, Number(limit) || 10), 20),
      },
      headers: {
        Authorization: `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': marketplaceId,
      },
      timeout: 8000,
    });

    const items = (res.data?.itemSummaries || [])
      .map(normalizeEbayItem)
      .filter(Boolean);

    return {
      provider: 'ebay',
      status: 'active',
      total: res.data?.total || items.length,
      products: items,
    };
  } catch (err) {
    const errorDetail =
      err.response?.data?.errors?.[0]?.message ||
      err.response?.data?.error_description ||
      err.message;

    return {
      provider: 'ebay',
      status: 'error',
      message: `eBay Browse API error: ${errorDetail}`,
      products: [],
    };
  }
}

/**
 * Refreshes an individual eBay offer during the scheduled monitoring cycle.
 * Called by providers/index.js.
 */
export async function fetchOffer(offer) {
  if (!isConfigured()) {
    return {
      provider: 'ebay',
      externalProductId: offer.externalProductId,
      success: false,
      errorMessage: 'eBay credentials not configured in server/.env',
    };
  }

  const token = await getAccessToken();
  if (!token) {
    return {
      provider: 'ebay',
      externalProductId: offer.externalProductId,
      success: false,
      errorMessage: 'eBay OAuth token unavailable',
    };
  }

  const { apiBaseUrl, marketplaceId } = getEnvConfig();
  const itemId = encodeURIComponent(String(offer.externalProductId));

  try {
    const res = await axios.get(`${apiBaseUrl}/item/${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': marketplaceId,
      },
      timeout: 8000,
    });

    const item = res.data;
    const rawValue = parseFloat(item.price?.value);
    if (isNaN(rawValue) || rawValue <= 0) {
      return {
        provider: 'ebay',
        externalProductId: offer.externalProductId,
        success: false,
        errorMessage: 'Invalid or missing price returned by eBay item API',
      };
    }

    const rawCurrency = (item.price?.currency || offer.currency || 'USD').toUpperCase();
    const priceInPaise = Math.round(rawValue * 100);
    const availability = item.estimatedAvailabilities?.[0]?.availabilityStatus === 'OUT_OF_STOCK'
      ? 'out_of_stock'
      : 'in_stock';

    return {
      provider: 'ebay',
      externalProductId: offer.externalProductId,
      title: item.title || offer.title,
      priceInPaise,
      originalPrice: rawValue,
      originalCurrency: rawCurrency,
      currency: rawCurrency,
      availability,
      productUrl: item.itemWebUrl || offer.productUrl,
      imageUrl: item.image?.imageUrl || offer.imageUrl,
      isSample: offer.isSample ?? false,
      dataStatus: offer.dataStatus || 'live',
      success: true,
      errorMessage: null,
    };
  } catch (err) {
    const status = err.response ? err.response.status : null;
    const detail =
      err.response?.data?.errors?.[0]?.message ||
      err.response?.data?.message ||
      err.message;

    return {
      provider: 'ebay',
      externalProductId: offer.externalProductId,
      success: false,
      errorMessage: status ? `eBay item API error (${status}): ${detail}` : `eBay fetch failed: ${detail}`,
    };
  }
}

/**
 * Diagnostic access verification function.
 * Tests keyset configuration, OAuth exchange, environment, scope, and Browse API access.
 * Sanitizes all output to ensure no secrets or sensitive tokens are ever returned.
 */
export async function verifyAccess() {
  const { env, isSandbox, marketplaceId } = getEnvConfig();
  const configured = isConfigured();

  const report = {
    provider: 'ebay',
    configured,
    environment: env,
    isSandbox,
    marketplaceId,
    credentialsPresent: {
      hasClientId: Boolean(process.env.EBAY_CLIENT_ID),
      hasClientSecret: Boolean(process.env.EBAY_CLIENT_SECRET),
    },
    authStatus: 'unconfigured',
    tokenScopeValid: false,
    browseApiStatus: 'untested',
    productionApproved: false,
    message: '',
    testedAt: new Date().toISOString(),
  };

  if (!configured) {
    report.message = 'EBAY_CLIENT_ID or EBAY_CLIENT_SECRET is missing from server/.env';
    return report;
  }

  // 1. Test OAuth token acquisition
  try {
    const token = await getAccessToken();
    if (!token) {
      report.authStatus = 'failed';
      report.message = 'OAuth client credentials token exchange failed. Verify client credentials and network.';
      return report;
    }

    report.authStatus = 'ok';
    report.tokenScopeValid = true;

    // 2. Test Browse API with a minimal keyword query
    const { apiBaseUrl } = getEnvConfig();
    try {
      const browseRes = await axios.get(`${apiBaseUrl}/item_summary/search`, {
        params: { q: 'laptop', limit: 1 },
        headers: {
          Authorization: `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': marketplaceId,
        },
        timeout: 8000,
      });

      if (browseRes.status === 200) {
        report.browseApiStatus = 'active';
        report.productionApproved = !isSandbox;
        report.message = isSandbox
          ? 'eBay Sandbox Browse API is responsive and functioning.'
          : 'eBay Production Browse API is verified and active.';
      }
    } catch (apiErr) {
      const errCode = apiErr.response?.data?.errors?.[0]?.errorId;
      const errMsg = apiErr.response?.data?.errors?.[0]?.message || apiErr.message;
      const status = apiErr.response?.status;

      if (status === 403 || errCode === 1100) {
        report.browseApiStatus = 'insufficient_permissions';
        report.productionApproved = false;
        report.message = `Browse API requires production access approval from eBay Developers portal (Error: ${errMsg})`;
      } else {
        report.browseApiStatus = 'error';
        report.message = `Browse API test returned status ${status}: ${errMsg}`;
      }
    }
  } catch (err) {
    report.authStatus = 'error';
    report.message = `Unexpected error during eBay diagnostic: ${err.message}`;
  }

  return report;
}

export default {
  isConfigured,
  getAccessToken,
  searchProducts,
  fetchOffer,
  normalizeEbayItem,
  verifyAccess,
  clearTokenCacheForTesting,
};
