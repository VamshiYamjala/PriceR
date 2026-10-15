// server/src/providers/scrapling.js
// Node.js Express provider adapter for the Python Scrapling Worker (Document Phase D).
// Communicates with http://127.0.0.1:8000/extract with strict timeout and validation.
// Never fabricates prices or replaces errors with sample data.

import axios from 'axios';

const WORKER_URL = process.env.SCRAPLING_WORKER_URL || 'http://127.0.0.1:8000';
const TIMEOUT_MS = 12000;

export async function isWorkerAvailable() {
  try {
    const res = await axios.get(`${WORKER_URL}/health`, { timeout: 2000 });
    return res.data?.status === 'healthy';
  } catch {
    return false;
  }
}

/**
 * Extracts product details via Python Scrapling worker.
 * @param {string} productUrl
 * @param {string} [currency='GBP']
 * @returns {Promise<object>} Normalized result with dataStatus: 'live' or 'unavailable'
 */
export async function extractFromUrl(productUrl, currency = 'GBP') {
  if (!productUrl || typeof productUrl !== 'string') {
    return {
      provider: 'scrapling',
      success: false,
      dataStatus: 'unavailable',
      errorMessage: 'Invalid or missing productUrl',
    };
  }

  try {
    const res = await axios.post(
      `${WORKER_URL}/extract`,
      { url: productUrl, currency },
      { timeout: TIMEOUT_MS }
    );

    const data = res.data;
    if (!data.success || !data.price_in_paise || data.price_in_paise <= 0) {
      return {
        provider: 'scrapling',
        productUrl,
        success: false,
        dataStatus: 'unavailable',
        errorMessage: data.error || 'Worker could not verify a valid price.',
      };
    }

    return {
      provider: 'scrapling',
      title: data.title || 'Extracted Product',
      productUrl: data.url,
      imageUrl: data.image_url,
      priceInPaise: data.price_in_paise,
      originalPrice: data.original_price,
      originalCurrency: data.original_currency,
      currency: data.currency || 'INR',
      availability: data.availability || 'in_stock',
      dataStatus: 'live', // Genuine extracted live offer from testbed
      isSample: false,
      success: true,
      retrievedAt: data.retrieved_at,
    };
  } catch (err) {
    const status = err.response ? err.response.status : null;
    const detail = err.response?.data?.detail || err.message;
    return {
      provider: 'scrapling',
      productUrl,
      success: false,
      dataStatus: 'unavailable',
      errorMessage: status
        ? `Worker error ${status}: ${detail}`
        : `Worker unreachable: ${detail}`,
    };
  }
}

/**
 * Adapter interface called by providers/index.js dispatcher for monitoring.
 */
export async function fetchOffer(offer) {
  const result = await extractFromUrl(offer.productUrl, offer.originalCurrency || 'GBP');
  return {
    ...result,
    externalProductId: offer.externalProductId,
  };
}

export default {
  extractFromUrl,
  fetchOffer,
  isWorkerAvailable,
};
