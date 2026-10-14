// server/src/providers/flipkart.js
// NOT WIRED INTO THE DISPATCHER BY DEFAULT. See providers/index.js and the
// switch-over checklist in Section 7.4 of Document 4. This file becomes live
// only after FLIPKART_AFFILIATE_ID / FLIPKART_AFFILIATE_TOKEN are real,
// approved credentials AND a manual test call has been verified to return a
// real price.
//
// The request/response shape here is inferred from Flipkart's official
// affiliate API documentation (af_overview.html, af_prod_ref.html) and is
// NOT yet verified against a live response — correct it against the real
// API the moment credentials exist (Section 7.4, step 2).

import axios from 'axios';

const FLIPKART_API_BASE = 'https://affiliate-api.flipkart.net/affiliate/1.0';
const REQUEST_TIMEOUT_MS = 8000;

/**
 * @param {object} offer - { provider: "flipkart", externalProductId: string }
 * @returns {Promise<object>} a partial NormalizedResult (fetchedAt is added by
 *   the dispatcher, not here). Never throws.
 */
export async function fetchOffer(offer) {
  const affiliateId = process.env.FLIPKART_AFFILIATE_ID;
  const affiliateToken = process.env.FLIPKART_AFFILIATE_TOKEN;

  if (!affiliateId || !affiliateToken) {
    return {
      provider: 'flipkart',
      externalProductId: offer.externalProductId,
      success: false,
      errorMessage:
        'FLIPKART_AFFILIATE_ID / FLIPKART_AFFILIATE_TOKEN are not set — Flipkart is not approved/configured yet.',
    };
  }

  try {
    const response = await axios.get(`${FLIPKART_API_BASE}/product.json`, {
      params: { id: offer.externalProductId },
      headers: {
        'Fk-Affiliate-Id': affiliateId,
        'Fk-Affiliate-Token': affiliateToken,
      },
      timeout: REQUEST_TIMEOUT_MS,
    });

    const product = response.data && response.data.productBaseInfoV1;
    if (!product) {
      return {
        provider: 'flipkart',
        externalProductId: offer.externalProductId,
        success: false,
        errorMessage:
          'Flipkart API response did not include productBaseInfoV1 — response shape may have changed; verify against the live docs.',
      };
    }

    const priceRupees =
      product.flipkartSpecialPrice?.amount ?? product.maximumRetailPrice?.amount;
    if (typeof priceRupees !== 'number') {
      return {
        provider: 'flipkart',
        externalProductId: offer.externalProductId,
        success: false,
        errorMessage: 'Flipkart API response did not include a usable price field.',
      };
    }

    return {
      provider: 'flipkart',
      externalProductId: offer.externalProductId,
      title: product.title || null,
      brand: product.attributes?.brand || null,
      model: product.attributes?.model || null,
      variant: product.attributes?.variant || null,
      priceInPaise: Math.round(priceRupees * 100), // Document 1 Section 5 precision policy
      currency: 'INR',
      availability: product.inStock ? 'in_stock' : 'out_of_stock',
      productUrl: product.productUrl || null,
      imageUrl: Array.isArray(product.imageUrls?.['200x200'])
        ? product.imageUrls['200x200'][0]
        : null,
      isSample: false, // real data only — this is the whole point of this file
      success: true,
      errorMessage: null,
    };
  } catch (err) {
    // Never throw. Every failure mode — timeout, 4xx, 5xx, malformed JSON,
    // DNS failure — collapses into the same shape priceMonitor.js expects.
    const status = err.response ? err.response.status : null;
    const detail =
      err.response?.data?.message || err.message || 'Unknown Flipkart API error';
    return {
      provider: 'flipkart',
      externalProductId: offer.externalProductId,
      success: false,
      errorMessage: status
        ? `Flipkart API error ${status}: ${detail}`
        : `Flipkart API request failed: ${detail}`,
    };
  }
}

export default { fetchOffer };
