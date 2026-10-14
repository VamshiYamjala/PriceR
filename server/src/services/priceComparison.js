// server/src/services/priceComparison.js
// Owner: Member 1
// Core price comparison logic. Determines lowest price and highlights differences
// across multiple retailer offers for the same product.
// Enforces rules from Multi-Provider Architecture (Prompt Section 9):
// 1. Only genuine, verified retailer offers participate in genuine market savings.
// 2. Currencies must match before comparing.
// 3. Out-of-stock and error offers are excluded.

/**
 * Finds the lowest price offer among a list of offers.
 * Per Document 1 Section 13.4, valid offers are those that are 'in_stock' or 'unknown',
 * excluding 'out_of_stock' or error statuses.
 *
 * @param {Array<object>} offers - list of Offer documents or objects
 * @param {object} [options] - { genuineOnly: boolean }
 * @returns {object|null} the lowest valid offer, or null if no valid offer exists
 */
export function findLowestOffer(offers = [], options = {}) {
  if (!Array.isArray(offers) || offers.length === 0) return null;

  const validOffers = offers.filter((o) => {
    if (!o) return false;
    if (o.availability === 'out_of_stock') return false;
    if (o.lastStatus === 'error') return false;
    if (typeof o.priceInPaise !== 'number' || o.priceInPaise <= 0) return false;
    if (options.genuineOnly && (o.isSample || o.dataStatus === 'sample')) return false;
    return true;
  });

  if (validOffers.length === 0) return null;

  return validOffers.reduce((lowest, current) => {
    return current.priceInPaise < lowest.priceInPaise ? current : lowest;
  });
}

/**
 * Calculates raw savings between two price points in paise and percentage.
 * @param {number} basePriceInPaise
 * @param {number} comparedPriceInPaise
 * @returns {{savingsInPaise: number, savingsPercent: number}}
 */
export function calculateSavings(basePriceInPaise, comparedPriceInPaise) {
  const diff = basePriceInPaise - comparedPriceInPaise;
  const percent = basePriceInPaise > 0 ? (diff / basePriceInPaise) * 100 : 0;
  return {
    savingsInPaise: Math.max(0, diff),
    savingsPercent: Math.max(0, Number(percent.toFixed(1))),
  };
}

/**
 * Evaluates savings between two offers with genuine retailer verification.
 * Rejects claiming market savings if either offer is sample data or currencies differ.
 *
 * @param {object} baseOffer
 * @param {object} comparedOffer
 * @returns {{savingsInPaise: number, savingsPercent: number, isGenuine: boolean, reason?: string}}
 */
export function calculateGenuineSavings(baseOffer, comparedOffer) {
  if (!baseOffer || !comparedOffer) {
    return { savingsInPaise: 0, savingsPercent: 0, isGenuine: false, reason: 'Missing offer' };
  }

  // Currency compatibility check
  const baseCurrency = (baseOffer.currency || 'INR').toUpperCase();
  const compCurrency = (comparedOffer.currency || 'INR').toUpperCase();
  if (baseCurrency !== compCurrency) {
    return {
      savingsInPaise: 0,
      savingsPercent: 0,
      isGenuine: false,
      reason: `Currency mismatch: ${baseCurrency} vs ${compCurrency}`,
    };
  }

  // Sample data check: sample data cannot be claimed as genuine real market savings
  const hasSampleData =
    baseOffer.isSample ||
    comparedOffer.isSample ||
    baseOffer.dataStatus === 'sample' ||
    comparedOffer.dataStatus === 'sample';

  const rawSavings = calculateSavings(baseOffer.priceInPaise, comparedOffer.priceInPaise);

  if (hasSampleData) {
    return {
      ...rawSavings,
      isGenuine: false,
      reason: 'Contains sample or simulated catalog data',
    };
  }

  return {
    ...rawSavings,
    isGenuine: true,
  };
}

export default { findLowestOffer, calculateSavings, calculateGenuineSavings };
