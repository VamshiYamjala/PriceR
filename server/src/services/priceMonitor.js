// server/src/services/priceMonitor.js
// Owner: Member 1 & Member 4
// Orchestrates the scheduled monitoring cycle:
// 1. Coordinates race-safe local mutex + atomic MongoDB-backed distributed lock (MonitorLock)
// 2. Emits periodic heartbeats during execution to prevent premature interruption of healthy jobs
// 3. Fetches each tracked offer once per cycle via providers dispatcher
// 4. Records PriceObservation entries
// 5. Updates Offer documents with lastFetchedAt, lastSuccessAt, and lastStatus
// 6. Evaluates all active alerts that depend on updated offers
// 7. Triggers email/telegram notifications through notification services and logs NotificationEvent
// 8. Persists finalized cycle metrics to MonitorRun and safely releases all locks in finally block

import mongoose from 'mongoose';
import providerDispatcher from '../providers/index.js';
import Offer from '../models/Offer.js';
import PriceObservation from '../models/PriceObservation.js';
import Alert from '../models/Alert.js';
import User from '../models/User.js';
import MonitorRun from '../models/MonitorRun.js';
import MonitorLock from '../models/MonitorLock.js';
import { evaluateAlert } from './alertEvaluator.js';
import { dispatchAlertNotifications, evaluateNotificationCompletion } from './alertDispatcher.js';

// Note on Durability across restarts:
// On Render free-tier, asynchronous background tasks execute in-process within the running container.
// While Render containers stay alive for at least 15 minutes after handling an HTTP request,
// a hosting platform restart, deployment, or SIGTERM terminates in-process promises immediately.
// The persistent MonitorRun document and MonitorLock lease record execution state and reconcile interrupted runs,
// but do not provide durable queue re-delivery across process crashes. True crash-resilient
// durable execution would require an external distributed message broker (e.g. BullMQ / Redis or SQS).

// Default heartbeat & lease expiration threshold: 15 minutes
export const STALE_LEASE_TIMEOUT_MS = 15 * 60 * 1000;

// In-memory monitoring state for fast local synchronous mutex and status reporting
let monitorState = {
  currentRunId: null,
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
 * Atomically acquires a MongoDB-backed distributed lease for the monitoring cycle.
 * Guarantees that only ONE backend instance can acquire the lock even if multiple
 * instances receive triggers at the exact same millisecond.
 */
export async function acquireDistributedLock(instanceId, staleTimeoutMs = STALE_LEASE_TIMEOUT_MS) {
  if (mongoose.connection.readyState !== 1) {
    return { acquired: true, lock: null, instanceId };
  }

  const now = new Date();
  const staleCutoff = new Date(now.getTime() - staleTimeoutMs);

  // 1. Atomically acquire if unlocked or if previous lease's heartbeat expired (stale recovery)
  let lock = await MonitorLock.findOneAndUpdate(
    {
      _id: 'monitoring_cycle_lock',
      $or: [
        { isLocked: false },
        { isLocked: null },
        { heartbeatAt: { $lt: staleCutoff } },
      ],
    },
    {
      $set: {
        isLocked: true,
        acquiredAt: now,
        heartbeatAt: now,
        instanceId,
      },
    },
    { new: true }
  );

  // 2. If the singleton lock document does not exist yet, create it atomically
  if (!lock) {
    const existing = await MonitorLock.findById('monitoring_cycle_lock');
    if (!existing) {
      try {
        lock = await MonitorLock.create({
          _id: 'monitoring_cycle_lock',
          isLocked: true,
          acquiredAt: now,
          heartbeatAt: now,
          instanceId,
        });
      } catch (err) {
        if (err.code === 11000) {
          // Lost race on initial creation to another instance
          lock = null;
        } else {
          throw err;
        }
      }
    } else if (existing.isLocked && existing.heartbeatAt && existing.heartbeatAt >= staleCutoff) {
      return {
        acquired: false,
        existingLock: existing,
        reason: 'ACTIVE_LEASE_HELD',
      };
    }
  }

  if (lock) {
    return { acquired: true, lock };
  }

  const current = await MonitorLock.findById('monitoring_cycle_lock');
  return {
    acquired: false,
    existingLock: current,
    reason: 'ACTIVE_LEASE_HELD',
  };
}

/**
 * Safely releases the distributed MongoDB lock.
 */
export async function releaseDistributedLock(runId) {
  if (mongoose.connection.readyState !== 1) {
    return;
  }
  try {
    const query = { _id: 'monitoring_cycle_lock' };
    if (runId) {
      query.$or = [{ currentRunId: runId }, { currentRunId: null }];
    }
    await MonitorLock.updateOne(query, {
      $set: {
        isLocked: false,
        currentRunId: null,
        heartbeatAt: null,
        instanceId: null,
      },
    });
  } catch (err) {
    console.error('[monitor] Error releasing distributed lock:', err.message);
  }
}

/**
 * Updates the lock heartbeat timestamp so healthy long-running jobs are never
 * prematurely marked stale or interrupted by age alone.
 */
export async function touchLockHeartbeat(runId) {
  if (mongoose.connection.readyState !== 1) {
    return;
  }
  try {
    const now = new Date();
    await MonitorLock.updateOne(
      { _id: 'monitoring_cycle_lock', isLocked: true },
      { $set: { heartbeatAt: now } }
    );
    if (runId) {
      await MonitorRun.updateOne(
        { _id: runId, status: 'running' },
        { $set: { updatedAt: now } }
      );
    }
  } catch (err) {
    console.warn('[monitor] Heartbeat update warning:', err.message);
  }
}

/**
 * Reconciles orphaned runs that were left in 'running' status when a server restarted.
 * Reconciles runs only if their last heartbeat/update is older than staleTimeoutMs (default: 15m),
 * protecting healthy long-running jobs from premature interruption.
 */
export async function reconcileStaleRuns(staleTimeoutMs = STALE_LEASE_TIMEOUT_MS) {
  if (mongoose.connection.readyState !== 1) {
    return 0;
  }
  const staleCutoff = new Date(Date.now() - staleTimeoutMs);
  const result = await MonitorRun.updateMany(
    { status: 'running', updatedAt: { $lt: staleCutoff } },
    {
      $set: {
        status: 'interrupted',
        completedAt: new Date(),
        failureReason: 'Cycle interrupted: process terminated unexpectedly (heartbeat expired).',
      },
    }
  );

  // If the lock lease expired without explicit release, mark it unlocked
  await MonitorLock.updateOne(
    { isLocked: true, heartbeatAt: { $lt: staleCutoff } },
    {
      $set: {
        isLocked: false,
        currentRunId: null,
        heartbeatAt: null,
        instanceId: null,
      },
    }
  );

  return result.modifiedCount || 0;
}

/**
 * Synchronously acquires the in-process mutex and atomically claims the distributed
 * MongoDB lease before yielding to async operations. Reconciles genuinely dead runs,
 * creates a persistent MonitorRun document, and launches background execution without holding the HTTP trigger open.
 */
export async function startMonitoringRun(options = {}) {
  // 1. Race-safe process-local check & acquisition before yielding to event loop
  if (monitorState.isRunning) {
    return {
      skipped: true,
      reason: 'OVERLAPPING_CYCLE',
      currentRunId: monitorState.currentRunId,
    };
  }
  monitorState.isRunning = true;

  const instanceId =
    options.instanceId || process.env.RENDER_INSTANCE_ID || `proc-${process.pid}-${Date.now()}`;

  try {
    let runId = null;
    const startedAt = new Date();

    if (mongoose.connection.readyState === 1) {
      // 2. Reconcile dead runs whose heartbeats have ceased for > 15m
      await reconcileStaleRuns(options.staleTimeoutMs || STALE_LEASE_TIMEOUT_MS);

      // 3. Atomically acquire distributed MongoDB lock
      const lockRes = await acquireDistributedLock(instanceId, options.staleTimeoutMs || STALE_LEASE_TIMEOUT_MS);

      if (!lockRes.acquired) {
        monitorState.isRunning = false;
        return {
          skipped: true,
          reason: 'OVERLAPPING_CYCLE',
          currentRunId: lockRes.existingLock?.currentRunId ? lockRes.existingLock.currentRunId.toString() : null,
        };
      }

      // If the acquired lock previously had an abandoned runId, reconcile that abandoned run
      if (lockRes.lock?.currentRunId) {
        await MonitorRun.updateOne(
          { _id: lockRes.lock.currentRunId, status: 'running' },
          {
            $set: {
              status: 'interrupted',
              completedAt: new Date(),
              failureReason: 'Reclaimed stale lease: previous instance ceased heartbeats.',
            },
          }
        );
      }

      // 4. Create persistent run document in MongoDB Atlas
      const run = await MonitorRun.create({
        status: 'running',
        triggeredBy: options.triggeredBy || 'github_actions',
        startedAt,
      });
      runId = run._id.toString();
      monitorState.currentRunId = runId;

      // Link current runId into the lock document
      await MonitorLock.updateOne(
        { _id: 'monitoring_cycle_lock' },
        { $set: { currentRunId: run._id } }
      );
    } else {
      runId = new mongoose.Types.ObjectId().toString();
      monitorState.currentRunId = runId;
    }

    // 5. Dispatch background execution asynchronously (detached promise with catch handler)
    executeCycleInBackground(runId, options);

    return {
      skipped: false,
      runId,
      status: 'running',
      startedAt,
    };
  } catch (err) {
    // In case of error during lock acquisition/creation, release both local & distributed locks
    monitorState.isRunning = false;
    monitorState.currentRunId = null;
    if (mongoose.connection.readyState === 1) {
      await releaseDistributedLock(null).catch(() => {});
    }
    throw err;
  }
}

/**
 * Executes a monitoring cycle in the background, ensuring all unhandled rejections
 * are caught and the MonitorRun document and all locks are safely released in finally block.
 */
function executeCycleInBackground(runId, options = {}) {
  runMonitoringCycle({ ...options, runId, isPreLocked: true }).catch(async (err) => {
    console.error(`[monitor] Unhandled background error in run ${runId}:`, err.message);
    try {
      if (mongoose.connection.readyState === 1) {
        await MonitorRun.findByIdAndUpdate(runId, {
          status: 'failed',
          completedAt: new Date(),
          failureReason: err.message || 'Fatal error during background cycle execution.',
        });
      }
    } catch (dbErr) {
      console.error('[monitor] Failed to update MonitorRun after fatal failure:', dbErr.message);
    } finally {
      monitorState.isRunning = false;
      monitorState.currentRunId = null;
      if (mongoose.connection.readyState === 1) {
        await releaseDistributedLock(runId);
      }
    }
  });
}

/**
 * Runs a full or on-demand price monitoring cycle.
 * Can be called standalone or as part of a managed runId.
 * @returns {Promise<{offersChecked: number, triggeredAlerts: number, errors: number, skipped: boolean, runId?: string}>}
 */
export async function runMonitoringCycle(options = {}) {
  if (process.env.MONITORING_ENABLED === 'false' && !options.force) {
    console.log('[monitor] Monitoring is disabled via MONITORING_ENABLED=false');
    return { offersChecked: 0, triggeredAlerts: 0, errors: 0, skipped: false };
  }

  // If not pre-locked by startMonitoringRun, acquire in-memory lock here
  if (!options.isPreLocked) {
    if (monitorState.isRunning) {
      console.warn('[monitor] Previous monitoring cycle still in progress; skipping overlapping cycle.');
      return {
        offersChecked: 0,
        triggeredAlerts: 0,
        errors: 0,
        skipped: true,
        reason: 'OVERLAPPING_CYCLE',
        currentRunId: monitorState.currentRunId,
      };
    }
    monitorState.isRunning = true;
  }

  const startTime = new Date();
  let runId = options.runId;
  let offersChecked = 0;
  let triggeredAlerts = 0;
  let errorsCount = 0;
  const sanitizedErrors = [];
  let fatalError = null;

  console.log(`[monitor] Starting price monitoring cycle${runId ? ` (runId: ${runId})` : ''}...`);

  try {
    // If runId was not provided (e.g. standalone/test execution), create MonitorRun on the fly if DB connected
    if (!runId && mongoose.connection.readyState === 1 && typeof MonitorRun?.create === 'function') {
      try {
        const runDoc = await MonitorRun.create({
          status: 'running',
          triggeredBy: options.triggeredBy || (process.env.NODE_ENV === 'test' ? 'test' : 'scheduler'),
          startedAt: startTime,
        });
        runId = runDoc._id.toString();
        monitorState.currentRunId = runId;
      } catch (e) {
        // Continue even if logging run fails in unit test
      }
    }

    // Find distinct offers associated with active alerts
    const activeAlerts = await Alert.find({ status: 'active' }).populate('offerId');
    const distinctOfferIds = [...new Set(activeAlerts.map((a) => a.offerId?._id?.toString()).filter(Boolean))];

    for (const offerId of distinctOfferIds) {
      try {
        const offer = await Offer.findById(offerId);
        if (!offer) continue;

        const fetchResult = await providerDispatcher.fetchOffer(offer);
        offersChecked++;

        // Touch lock heartbeat after each offer check to preserve healthy long-running execution
        await touchLockHeartbeat(runId);

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
          const errMsg = fetchResult.errorMessage || 'Fetch failed';
          offer.lastFetchedAt = new Date();
          offer.lastStatus = 'error';
          offer.lastError = errMsg;
          await offer.save();

          sanitizedErrors.push({
            offerId: offer._id,
            provider: offer.provider,
            message: errMsg,
          });

          await PriceObservation.create({
            offerId: offer._id,
            status: 'failure',
            errorMessage: errMsg,
            fetchedAt: new Date(),
          });
        }
      } catch (err) {
        errorsCount++;
        sanitizedErrors.push({
          offerId,
          provider: 'unknown',
          message: err.message,
        });
        console.error(`[monitor] Error processing offer ${offerId}:`, err.message);
      }
    }
  } catch (err) {
    fatalError = err.message;
    console.error('[monitor] Fatal error during monitoring cycle:', err.message);
    throw err;
  } finally {
    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startTime.getTime();

    monitorState = {
      currentRunId: null,
      lastRunAt: completedAt.toISOString(),
      lastRunOffersChecked: offersChecked,
      lastRunErrors: errorsCount,
      isRunning: false,
    };

    // Update persistent MonitorRun document
    if (runId && mongoose.connection.readyState === 1) {
      try {
        await MonitorRun.findByIdAndUpdate(runId, {
          status: fatalError ? 'failed' : 'completed',
          completedAt,
          durationMs,
          offersAttempted: offersChecked,
          offersSuccessful: offersChecked - errorsCount,
          offersFailed: errorsCount,
          triggeredAlerts,
          errors: sanitizedErrors,
          failureReason: fatalError,
        });
      } catch (dbErr) {
        console.error('[monitor] Failed to update finalized MonitorRun document:', dbErr.message);
      }

      // Safely release the distributed MongoDB lock
      await releaseDistributedLock(runId);
    }
  }

  console.log(
    `[monitor] Cycle finished. Checked ${offersChecked} offers, triggered ${triggeredAlerts} alerts, encountered ${errorsCount} errors.`
  );
  return {
    runId,
    offersChecked,
    triggeredAlerts,
    errors: errorsCount,
    skipped: false,
  };
}

export default {
  startMonitoringRun,
  runMonitoringCycle,
  getMonitorState,
  setMonitorStateForTesting,
  reconcileStaleRuns,
  acquireDistributedLock,
  releaseDistributedLock,
  touchLockHeartbeat,
};
