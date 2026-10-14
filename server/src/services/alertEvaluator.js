// server/src/services/alertEvaluator.js
// Owner: Member 1 (coordinate with Member 3 on Alert model fields)
// Evaluates active user alerts against fresh price observations.
// Implements duplicate suppression, re-arming, and dedupeKey generation.

/**
 * Evaluates a single alert against current and previous price observations.
 * Document 1 Section 9.
 *
 * @param {object} alert - Alert document or object
 * @param {number} currentPriceInPaise - latest observed price
 * @param {number|null} previousPriceInPaise - prior observed price
 * @returns {{conditionMet: boolean, shouldNotify: boolean, shouldRearm: boolean, reason: string, dedupeKey: string}}
 */
export function evaluateAlert(alert, currentPriceInPaise, previousPriceInPaise = null) {
  const alertId = alert?._id ? alert._id.toString() : 'unknown';

  // Safety net: Never trigger an alert on invalid, zero, or negative price observation (Document 1 Section 10.6)
  if (
    typeof currentPriceInPaise !== 'number' ||
    isNaN(currentPriceInPaise) ||
    currentPriceInPaise <= 0
  ) {
    return {
      conditionMet: false,
      shouldNotify: false,
      shouldRearm: false,
      reason: 'Invalid or non-positive price observation',
      dedupeKey: `${alertId}:invalid`,
    };
  }

  let conditionMet = false;
  let reason = '';

  if (alert.type === 'target_price') {
    if (typeof alert.targetPriceInPaise === 'number' && alert.targetPriceInPaise > 0) {
      conditionMet = currentPriceInPaise <= alert.targetPriceInPaise;
      if (conditionMet) {
        reason = `Price dropped to ₹${(currentPriceInPaise / 100).toFixed(0)}, meeting your target of ₹${(alert.targetPriceInPaise / 100).toFixed(0)}.`;
      }
    }
  } else if (alert.type === 'fixed_drop') {
    if (
      typeof previousPriceInPaise === 'number' &&
      previousPriceInPaise > 0 &&
      typeof alert.dropAmountInPaise === 'number' &&
      alert.dropAmountInPaise > 0
    ) {
      const drop = previousPriceInPaise - currentPriceInPaise;
      conditionMet = drop >= alert.dropAmountInPaise;
      if (conditionMet) {
        reason = `Price dropped by ₹${(drop / 100).toFixed(0)}, meeting your drop threshold of ₹${(alert.dropAmountInPaise / 100).toFixed(0)}.`;
      }
    }
  }

  // Deduplication & armed state logic (Document 1 Section 9.3)
  // An alert notifies ONLY if conditionMet AND it is armed AND status is active
  const isArmed = Boolean(alert.armed);
  const isActive = alert.status === 'active';
  const shouldNotify = Boolean(conditionMet && isArmed && isActive);

  // Re-arming: When the condition is no longer met and the alert is disarmed, re-arm it
  const shouldRearm = Boolean(!conditionMet && !isArmed && isActive);

  // dedupeKey format ensures one send per condition state / cycle
  const dedupeKey = `${alertId}:${currentPriceInPaise}`;

  return {
    conditionMet,
    shouldNotify,
    shouldRearm,
    reason,
    dedupeKey,
  };
}

export default { evaluateAlert };
