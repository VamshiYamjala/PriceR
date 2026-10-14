// server/src/providers/index.js
// The provider dispatcher (Document 4, Section 5.3).
// Routes each offer to the appropriate provider adapter and attaches
// a consistent fetchedAt timestamp. Never throws.

import * as fixtureProvider from './fixture.js';
import * as flipkartProvider from './flipkart.js';
import * as amazonProvider from './amazon.js';
import * as dummyjsonProvider from './dummyjson.js';
import * as mockshopProvider from './mockshop.js';

/**
 * Dispatches an offer fetch to the configured provider.
 * @param {object} offer - { provider, externalProductId, isSample, ... }
 * @returns {Promise<object>} Normalized result with fetchedAt timestamp
 */
export async function fetchOffer(offer) {
  let result;

  if (offer.provider === 'dummyjson') {
    result = await dummyjsonProvider.fetchOffer(offer);
  } else if (offer.provider === 'mockshop') {
    result = await mockshopProvider.fetchOffer(offer);
  } else if (offer.isSample) {
    // Every sample offer goes to the fixture provider, regardless of whether
    // its provider label is "flipkart" or "amazon". We do NOT use provider-based
    // routing here, because a "flipkart"-labeled offer can still be sample data
    // until Flipkart approval is verified (Document 1, Section 10.4).
    result = await fixtureProvider.fetchOffer(offer);
  } else if (offer.provider === 'flipkart') {
    // NOT WIRED IN BY DEFAULT. See providers/flipkart.js and the switch-over
    // checklist in Document 4, Section 7.4.
    result = await fixtureProvider.fetchOffer(offer);
  } else if (offer.provider === 'amazon') {
    // Amazon NEVER has a live code path (Document 1, Section 10.2).
    result = await amazonProvider.fetchOffer(offer);
  } else {
    result = {
      provider: offer.provider,
      externalProductId: offer.externalProductId,
      success: false,
      errorMessage: `No provider configured for provider="${offer.provider}"`,
    };
  }

  // fetchedAt is set here, by the dispatcher, not by the individual provider
  // file — this keeps "when did we actually attempt this" consistent and in
  // one place, rather than trusting each provider to timestamp itself correctly.
  return {
    ...result,
    fetchedAt: new Date().toISOString(),
  };
}

export default { fetchOffer };
