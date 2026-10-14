// server/src/services/priceMonitor.js
// Owner: Member 1
// Orchestrates the scheduled monitoring cycle:
// 1. Fetches each tracked offer once per cycle via providers dispatcher
// 2. Records PriceObservation entries
// 3. Updates Offer documents with lastFetchedAt, lastSuccessAt, and lastStatus
// 4. Evaluates all active alerts that depend on updated offers
// 5. Triggers email/telegram notifications through notification services

import { fetchOffer } from '../providers/index.js';
import Offer from '../models/Offer.js';
import PriceObservation from '../models/PriceObservation.js';
import Alert from '../models/Alert.js';
import { evaluateAlert } from './alertEvaluator.js';

/**
 * Runs a full or on-demand price monitoring cycle.
 * @returns {Promise<{offersChecked: number, triggeredAlerts: number}>}
 */
export async function runMonitoringCycle() {
  if (process.env.MONITORING_ENABLED === 'false') {
    console.log('[monitor] Monitoring is disabled via MONITORING_ENABLED=false');
    return { offersChecked: 0, triggeredAlerts: 0 };
  }

  console.log('[monitor] Starting price monitoring cycle...');
  // Find distinct offers associated with active alerts or watchlists
  const activeAlerts = await Alert.find({ status: 'active' }).populate('offerId');
  const distinctOfferIds = [...new Set(activeAlerts.map((a) => a.offerId?._id?.toString()).filter(Boolean))];

  let offersChecked = 0;
  let triggeredAlerts = 0;

  for (const offerId of distinctOfferIds) {
    try {
      const offer = await Offer.findById(offerId);
      if (!offer) continue;

      const fetchResult = await fetchOffer(offer);
      offersChecked++;

      if (fetchResult.success && typeof fetchResult.priceInPaise === 'number') {
        const previousPrice = offer.priceInPaise;
        offer.priceInPaise = fetchResult.priceInPaise;
        offer.lastFetchedAt = new Date();
        offer.lastSuccessAt = new Date();
        offer.lastStatus = 'ok';
        offer.lastError = null;
        await offer.save();

        await PriceObservation.create({
          offerId: offer._id,
          priceInPaise: fetchResult.priceInPaise,
          status: 'success',
          fetchedAt: new Date(),
        });

        // Evaluate dependent alerts
        const dependentAlerts = activeAlerts.filter(
          (a) => a.offerId?._id?.toString() === offer._id.toString()
        );

        for (const alert of dependentAlerts) {
          const evalResult = evaluateAlert(alert, fetchResult.priceInPaise, previousPrice);
          if (evalResult.shouldNotify) {
            triggeredAlerts++;
            alert.armed = false;
            alert.lastTriggeredAt = new Date();
            await alert.save();
            // Member 4's notification dispatch is invoked here
          } else if (evalResult.shouldRearm) {
            alert.armed = true;
            await alert.save();
          }
        }
      } else {
        // Record failure safely — never 0 rupees
        offer.lastFetchedAt = new Date();
        offer.lastStatus = 'error';
        offer.lastError = fetchResult.errorMessage || 'Fetch failed';
        await offer.save();

        await PriceObservation.create({
          offerId: offer._id,
          status: 'failure',
          errorMessage: fetchResult.errorMessage,
          fetchedAt: new Date(),
        });
      }
    } catch (err) {
      console.error(`[monitor] Error processing offer ${offerId}:`, err.message);
    }
  }

  console.log(`[monitor] Cycle finished. Checked ${offersChecked} offers, triggered ${triggeredAlerts} alerts.`);
  return { offersChecked, triggeredAlerts };
}

export default { runMonitoringCycle };
