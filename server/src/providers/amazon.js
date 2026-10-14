// server/src/providers/amazon.js
// Amazon NEVER has a live code path in this project (Document 1, Section 10.2).
// Any non-sample Amazon offer is a data error, not something to fetch live.
// All Amazon offers appear exclusively as simulated sample data via fixture.js.

/**
 * Amazon fetch offer handler. Explicitly rejects non-sample requests.
 * @param {object} offer - { provider: "amazon", externalProductId: string }
 * @returns {Promise<object>}
 */
export async function fetchOffer(offer) {
  return {
    provider: 'amazon',
    externalProductId: offer.externalProductId,
    success: false,
    errorMessage:
      'Amazon has no live provider in this project — Amazon offers must always be isSample: true.',
  };
}

export default { fetchOffer };
