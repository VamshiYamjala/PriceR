// server/src/providers/index.js
// The provider dispatcher (Document 4, Section 5.3).
// Routes each offer to the appropriate provider adapter and attaches
// a consistent fetchedAt timestamp. Never throws.

import * as fixtureProvider from './fixture.js';
import * as flipkartProvider from './flipkart.js';
import * as amazonProvider from './amazon.js';
import * as dummyjsonProvider from './dummyjson.js';
import * as mockshopProvider from './mockshop.js';
import * as scraplingProvider from './scrapling.js';
import * as apifyProvider from './apify.js';
import * as ebayProvider from './ebay.js';

/**
 * Dispatches an offer fetch to the configured provider.
 * @param {object} offer - { provider, externalProductId, isSample, ... }
 * @returns {Promise<object>} Normalized result with fetchedAt timestamp
 */
export async function fetchOffer(offer) {
  let result;

  if (offer.provider === 'apify') {
    result = await apifyProvider.fetchOffer(offer);
  } else if (offer.provider === 'ebay') {
    result = await ebayProvider.fetchOffer(offer);
  } else if (offer.provider === 'dummyjson') {
    result = await dummyjsonProvider.fetchOffer(offer);
  } else if (offer.provider === 'mockshop') {
    result = await mockshopProvider.fetchOffer(offer);
  } else if (offer.provider === 'scrapling') {
    result = await scraplingProvider.fetchOffer(offer);
  } else if (offer.isSample || offer.provider === 'fixture') {
    // Every sample/fixture offer goes to the fixture provider.
    result = await fixtureProvider.fetchOffer(offer);
  } else if (offer.provider === 'flipkart') {
    // Live Flipkart affiliate API is not wired in by default (Document 4, Section 7.4).
    // Live offers must never silently masquerade as successfully refreshed via fixture data.
    result = {
      provider: offer.provider,
      externalProductId: offer.externalProductId,
      success: false,
      errorMessage: 'Live Flipkart affiliate API is not configured; live offers cannot be refreshed via fixture data.',
    };
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
