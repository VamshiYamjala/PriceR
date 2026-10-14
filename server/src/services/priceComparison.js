// server/src/services/priceComparison.js
// Owner: Member 1
// Core price comparison logic. Determines lowest price and highlights differences
// across multiple retailer offers for the same product.

/**
 * Finds the lowest price offer among a list of offers.
 * Per Document 1 Section 13.4, valid offers are those that are 'in_stock' or 'unknown',
 * excluding 'out_of_stock' or error statuses.
 *
 * @param {Array<object>} offers - list of Offer documents or objects
 * @returns {object|null} the lowest valid offer, or null if no valid offer exists
 */
export function findLowestOffer(offers = []) {
  if (!Array.isArray(offers) || offers.length === 0) return null;

  const validOffers = offers.filter(
    (o) => o.availability !== 'out_of_stock' && o.lastStatus !== 'error'
  );

  if (validOffers.length === 0) return null;

  return validOffers.reduce((lowest, current) => {
    return current.priceInPaise < lowest.priceInPaise ? current : lowest;
  });
}

/**
 * Calculates savings between two offers in paise and percentage.
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

export default { findLowestOffer, calculateSavings };
