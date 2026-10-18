// server/src/services/priceMonitor.js
// Owner: Member 1 & Member 4
// Orchestrates the scheduled monitoring cycle:
// 1. Fetches each tracked offer once per cycle via providers dispatcher
// 2. Records PriceObservation entries
// 3. Updates Offer documents with lastFetchedAt, lastSuccessAt, and lastStatus
// 4. Evaluates all active alerts that depend on updated offers
// 5. Triggers email/telegram notifications through notification services and logs NotificationEvent

import providerDispatcher from '../providers/index.js';
import Offer from '../models/Offer.js';
import PriceObservation from '../models/PriceObservation.js';
import Alert from '../models/Alert.js';
import User from '../models/User.js';
import { evaluateAlert } from './alertEvaluator.js';
import { dispatchAlertNotifications, evaluateNotificationCompletion } from './alertDispatcher.js';

// In-memory monitoring state for reporting via GET /api/monitor/status
let monitorState = {
  lastRunAt: null,
  lastRunOffersChecked: 0,
  lastRunErrors: 0,
  isRunning: false,
};

/**
 * Returns a snapshot of the price monitor status.
 */
export function getMonitorState() {
  return { ...monitorState };
}

/**
 * Test helper to reset or seed monitor state.
 */
export function setMonitorStateForTesting(state) {
  monitorState = {
    ...monitorState,
    ...state,
  };
}

/**
 * Runs a full or on-demand price monitoring cycle.
 * @returns {Promise<{offersChecked: number, triggeredAlerts: number, errors: number}>}
 */
export async function runMonitoringCycle(options = {}) {
  if (process.env.MONITORING_ENABLED === 'false' && !options.force) {
    console.log('[monitor] Monitoring is disabled via MONITORING_ENABLED=false');
    return { offersChecked: 0, triggeredAlerts: 0, errors: 0, skipped: false };
  }

  if (monitorState.isRunning) {
    console.warn('[monitor] Previous monitoring cycle still in progress; skipping overlapping cycle.');
    return {
      offersChecked: 0,
      triggeredAlerts: 0,
      errors: 0,
      skipped: true,
      reason: 'OVERLAPPING_CYCLE',
    };
  }

  console.log('[monitor] Starting price monitoring cycle...');
  monitorState.isRunning = true;

  let offersChecked = 0;
  let triggeredAlerts = 0;
  let errorsCount = 0;

  try {
    // Find distinct offers associated with active alerts
    const activeAlerts = await Alert.find({ status: 'active' }).populate('offerId');
    const distinctOfferIds = [...new Set(activeAlerts.map((a) => a.offerId?._id?.toString()).filter(Boolean))];

    for (const offerId of distinctOfferIds) {
      try {
        const offer = await Offer.findById(offerId);
        if (!offer) continue;

        const fetchResult = await providerDispatcher.fetchOffer(offer);
        offersChecked++;

        if (fetchResult.success && typeof fetchResult.priceInPaise === 'number' && fetchResult.priceInPaise > 0) {
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
            const evalResult = evaluateAlert(alert, fetchResult.priceInPaise, previousPrice, {
              currency: fetchResult.currency || offer.currency,
              targetCurrency: offer.currency,
            });

            if (evalResult.shouldNotify) {
              // Dispatch multi-channel notifications and record NotificationEvent
              const dispatchResults = await dispatchAlertNotifications({ alert, offer, evalResult });
              const { allComplete, pendingChannels } = evaluateNotificationCompletion(alert, dispatchResults);

              if (allComplete) {
                triggeredAlerts++;
                alert.armed = false;
                alert.lastTriggeredAt = new Date();
                await alert.save();
              } else {
                console.warn(
                  `[monitor] Alert ${alert._id} notification delivery incomplete (pending: ${pendingChannels.join(', ')}); retaining armed state for retry.`
                );
              }
            } else if (evalResult.shouldRearm) {
              alert.armed = true;
              await alert.save();
            }
          }
        } else {
          // Record failure safely — never 0 rupees (Document 1 Section 10.6)
          errorsCount++;
          offer.lastFetchedAt = new Date();
          offer.lastStatus = 'error';
          offer.lastError = fetchResult.errorMessage || 'Fetch failed';
          await offer.save();

          await PriceObservation.create({
            offerId: offer._id,
            status: 'failure',
            errorMessage: fetchResult.errorMessage || 'Fetch failed',
            fetchedAt: new Date(),
          });
        }
      } catch (err) {
        errorsCount++;
        console.error(`[monitor] Error processing offer ${offerId}:`, err.message);
      }
    }
  } finally {
    monitorState = {
      lastRunAt: new Date().toISOString(),
      lastRunOffersChecked: offersChecked,
      lastRunErrors: errorsCount,
      isRunning: false,
    };
  }

  console.log(`[monitor] Cycle finished. Checked ${offersChecked} offers, triggered ${triggeredAlerts} alerts, encountered ${errorsCount} errors.`);
  return { offersChecked, triggeredAlerts, errors: errorsCount, skipped: false };
}

export default { runMonitoringCycle, getMonitorState, setMonitorStateForTesting };
