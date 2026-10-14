// server/src/services/priceMonitor.js
// Owner: Member 1 & Member 4
// Orchestrates the scheduled monitoring cycle:
// 1. Fetches each tracked offer once per cycle via providers dispatcher
// 2. Records PriceObservation entries
// 3. Updates Offer documents with lastFetchedAt, lastSuccessAt, and lastStatus
// 4. Evaluates all active alerts that depend on updated offers
// 5. Triggers email/telegram notifications through notification services and logs NotificationEvent

import { fetchOffer } from '../providers/index.js';
import Offer from '../models/Offer.js';
import PriceObservation from '../models/PriceObservation.js';
import Alert from '../models/Alert.js';
import User from '../models/User.js';
import NotificationEvent from '../models/NotificationEvent.js';
import { evaluateAlert } from './alertEvaluator.js';
import { sendEmail } from './notifications/email.js';
import { sendMessage } from './notifications/telegram.js';

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
export async function runMonitoringCycle() {
  if (process.env.MONITORING_ENABLED === 'false') {
    console.log('[monitor] Monitoring is disabled via MONITORING_ENABLED=false');
    return { offersChecked: 0, triggeredAlerts: 0, errors: 0 };
  }

  console.log('[monitor] Starting price monitoring cycle...');
  monitorState.isRunning = true;

  // Find distinct offers associated with active alerts
  const activeAlerts = await Alert.find({ status: 'active' }).populate('offerId');
  const distinctOfferIds = [...new Set(activeAlerts.map((a) => a.offerId?._id?.toString()).filter(Boolean))];

  let offersChecked = 0;
  let triggeredAlerts = 0;
  let errorsCount = 0;

  for (const offerId of distinctOfferIds) {
    try {
      const offer = await Offer.findById(offerId);
      if (!offer) continue;

      // Do not attempt live price monitoring for DummyJSON or mock.shop sample catalogs (Prompt Section 11)
      if (offer.provider === 'dummyjson' || offer.provider === 'mockshop') {
        continue;
      }

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

            // Dispatch multi-channel notifications and record NotificationEvent
            const user = await User.findById(alert.userId);
            if (user) {
              const channels = Array.isArray(alert.channels) && alert.channels.length > 0 ? alert.channels : ['email'];
              const isSampleOffer = Boolean(offer.isSample || offer.dataStatus === 'sample');
              const subjectTag = isSampleOffer ? '[PriceRadar Demo Alert]' : '[PriceRadar Alert]';
              const demoNotice = isSampleOffer
                ? '\n\n(Notice: This alert was triggered by a simulated sample/demo offer, not a verified live retailer drop.)'
                : '';

              for (const channel of channels) {
                let sendResult = { success: false, errorMessage: null };
                const message = `${evalResult.reason}${demoNotice}`;

                if (channel === 'email') {
                  sendResult = await sendEmail({
                    to: user.email,
                    subject: `${subjectTag} ${offer.title}`,
                    text: `Hello ${user.name},\n\n${evalResult.reason}${demoNotice}\n\nView offer: ${offer.productUrl}\n\nPriceRadar Team`,
                  });
                } else if (channel === 'telegram') {
                  if (user.telegramChatId) {
                    sendResult = await sendMessage({
                      chatId: user.telegramChatId,
                      text: `<b>${subjectTag}</b>\n\n${evalResult.reason}${demoNotice ? '<i>' + demoNotice + '</i>' : ''}\n\n<a href="${offer.productUrl}">View Offer</a>`,
                    });
                  } else {
                    sendResult = {
                      success: false,
                      errorMessage: 'User has not linked their Telegram account.',
                    };
                  }
                }

                try {
                  await NotificationEvent.create({
                    userId: user._id,
                    alertId: alert._id,
                    channel,
                    status: sendResult.success ? 'sent' : 'failed',
                    message,
                    errorMessage: sendResult.errorMessage || undefined,
                    dedupeKey: `${evalResult.dedupeKey}:${channel}`,
                  });
                } catch (eventErr) {
                  if (eventErr.code === 11000) {
                    console.log(`[monitor] Duplicate notification suppressed by index for alert ${alert._id}`);
                  } else {
                    console.error('[monitor] Error recording NotificationEvent:', eventErr.message);
                  }
                }
              }
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
          errorMessage: fetchResult.errorMessage,
          fetchedAt: new Date(),
        });
      }
    } catch (err) {
      errorsCount++;
      console.error(`[monitor] Error processing offer ${offerId}:`, err.message);
    }
  }

  monitorState = {
    lastRunAt: new Date().toISOString(),
    lastRunOffersChecked: offersChecked,
    lastRunErrors: errorsCount,
    isRunning: false,
  };

  console.log(`[monitor] Cycle finished. Checked ${offersChecked} offers, triggered ${triggeredAlerts} alerts, encountered ${errorsCount} errors.`);
  return { offersChecked, triggeredAlerts, errors: errorsCount };
}

export default { runMonitoringCycle, getMonitorState, setMonitorStateForTesting };
