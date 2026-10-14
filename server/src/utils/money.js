// server/src/utils/money.js
// Paise-money precision policy (Document 1, Section 5):
// Every price is stored as an integer number of paise (rupees * 100, rounded)
// in a field named priceInPaise, never as a JavaScript float.
// This prevents floating point inaccuracy (0.1 + 0.2 !== 0.3) in price-drop calculations.

/**
 * Convert rupees to integer paise.
 * @param {number} rupees
 * @returns {number} integer paise
 */
export function rupeesToPaise(rupees) {
  if (typeof rupees !== 'number' || isNaN(rupees)) {
    throw new TypeError('rupees must be a valid number');
  }
  return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees (for display or calculations).
 * @param {number} paise
 * @returns {number} rupees
 */
export function paiseToRupees(paise) {
  if (typeof paise !== 'number' || !Number.isInteger(paise)) {
    throw new TypeError('paise must be an integer');
  }
  return paise / 100;
}

/**
 * Format paise as an Indian Rupee string (e.g. ₹14,999).
 * @param {number} paise
 * @returns {string} formatted INR string
 */
export function formatRupees(paise) {
  const rupees = paiseToRupees(paise);
  return rupees.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
}
