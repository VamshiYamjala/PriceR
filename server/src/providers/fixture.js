// server/src/providers/fixture.js
// The guaranteed fallback provider (Document 1, Section 10.3). Every offer this
// project runs on until/unless Flipkart approval is verified goes through here.
// Reads server/src/providers/fixtureData.json and simulates a real network call
// — including the ability to deliberately fail one entry on demand, so the team
// can test the failure path (ACC-06) without needing a real provider outage.

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fixtureData = require('./fixtureData.json');

// Flatten the product-grouped JSON into a single lookup keyed by
// "provider:externalProductId", which is exactly how an Offer document
// identifies which fixture entry it corresponds to.
const offersByKey = new Map();
for (const product of fixtureData) {
  for (const offer of product.offers) {
    const key = `${offer.provider}:${offer.externalProductId}`;
    offersByKey.set(key, { ...offer, product });
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {object} offer - { provider, externalProductId, ... }
 * @returns {Promise<object>} a partial NormalizedResult (fetchedAt is added
 *   by the dispatcher in providers/index.js, not here).
 */
export async function fetchOffer(offer) {
  // Simulate a small, realistic network delay (150-400ms) so the monitoring
  // cycle behaves like it would against a real API, instead of resolving
  // instantly and hiding timing bugs.
  await sleep(150 + Math.floor(Math.random() * 250));
  const key = `${offer.provider}:${offer.externalProductId}`;
  const entry = offersByKey.get(key);

  if (!entry) {
    return {
      provider: offer.provider,
      externalProductId: offer.externalProductId,
      success: false,
      errorMessage: `No fixture entry found for ${key}. Check fixtureData.json.`,
    };
  }

  // The deliberate-failure path: flip forceFail to true on any entry in
  // fixtureData.json to simulate a provider outage for that one offer only,
  // without affecting anything else (used by ACC-06, see Section 14 below).
  if (entry.forceFail) {
    return {
      provider: entry.provider,
      externalProductId: entry.externalProductId,
      success: false,
      errorMessage: 'Simulated provider failure (forceFail: true in fixtureData.json).',
    };
  }

  return {
    provider: entry.provider,
    externalProductId: entry.externalProductId,
    title: entry.title,
    brand: entry.product.brand || null,
    model: entry.product.model || null,
    variant: entry.product.variant || null,
    priceInPaise: entry.priceInPaise,
    currency: entry.currency,
    availability: entry.availability,
    productUrl: entry.productUrl,
    imageUrl: entry.product.imageUrl || null,
    isSample: true, // always true for fixture data — see Document 1, Section 10.3/10.4
    success: true,
    errorMessage: null,
  };
}

export default { fetchOffer };
