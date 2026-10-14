// server/src/services/alertEvaluator.js
// Owner: Member 1 (coordinate with Member 3 on Alert model fields)
// Evaluates active user alerts against fresh price observations.
// Implements duplicate suppression, re-arming, and dedupeKey generation.

/**
 * Evaluates a single alert against current and previous price observations.
 * Document 1 Section 9.
 *
 * @param {object} alert - Alert Mongoose document
 * @param {number} currentPriceInPaise - latest observed price
 * @param {number|null} previousPriceInPaise - prior observed price
 * @returns {{shouldNotify: boolean, reason: string, shouldRearm: boolean, dedupeKey: string}}
 */
export function evaluateAlert(alert, currentPriceInPaise, previousPriceInPaise = null) {
  let conditionMet = false;
  let reason = '';

  if (alert.type === 'target_price') {
    conditionMet = currentPriceInPaise <= alert.targetPriceInPaise;
    reason = `Price dropped to ₹${(currentPriceInPaise / 100).toFixed(0)}, meeting your target of ₹${(alert.targetPriceInPaise / 100).toFixed(0)}.`;
  } else if (alert.type === 'fixed_drop') {
    if (previousPriceInPaise !== null && previousPriceInPaise > currentPriceInPaise) {
      const drop = previousPriceInPaise - currentPriceInPaise;
      conditionMet = drop >= alert.dropAmountInPaise;
      reason = `Price dropped by ₹${(drop / 100).toFixed(0)}, meeting your drop threshold of ₹${(alert.dropAmountInPaise / 100).toFixed(0)}.`;
    }
  }

  // Deduplication & armed state logic (Document 1 Section 9.3)
  const shouldNotify = Boolean(conditionMet && alert.armed && alert.status === 'active');
  const shouldRearm = Boolean(!conditionMet && !alert.armed);

  // dedupeKey format ensures one send per condition state / cycle
  const dedupeKey = `${alert._id.toString()}:${currentPriceInPaise}`;

  return {
    conditionMet,
    shouldNotify,
    shouldRearm,
    reason,
    dedupeKey,
  };
}

export default { evaluateAlert };
