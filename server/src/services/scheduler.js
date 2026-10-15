// server/src/services/scheduler.js
// Dedicated in-process scheduler for automatic price refreshes (Document Phase B)
// Runs periodic price monitoring every 4 hours by default (configurable via MONITOR_INTERVAL_HOURS or MONITOR_INTERVAL_MS).
// Features mutex-protected overlapping prevention, graceful shutdown, and bounded execution.

import { runMonitoringCycle, getMonitorState } from './priceMonitor.js';

let intervalTimer = null;
let isJobRunning = false;
let isStarted = false;

// Default: 4 hours in milliseconds
const DEFAULT_INTERVAL_MS = 4 * 60 * 60 * 1000;

export function getSchedulerIntervalMs() {
  if (process.env.MONITOR_INTERVAL_MS) {
    const parsed = parseInt(process.env.MONITOR_INTERVAL_MS, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  if (process.env.MONITOR_INTERVAL_HOURS) {
    const hours = parseFloat(process.env.MONITOR_INTERVAL_HOURS);
    if (!isNaN(hours) && hours > 0) return Math.round(hours * 3600 * 1000);
  }
  return DEFAULT_INTERVAL_MS;
}

/**
 * Executes a single monitoring cycle with concurrency mutex.
 * Never throws unhandled errors.
 * @param {Function} [runner=runMonitoringCycle] - Optional runner function for dependency injection
 */
export async function triggerScheduledCycle(runner = runMonitoringCycle) {
  if (isJobRunning) {
    console.warn('[scheduler] Previous monitoring cycle still running; skipping overlapping cycle.');
    return { skipped: true, reason: 'OVERLAPPING_CYCLE' };
  }

  isJobRunning = true;
  try {
    const result = await runner();
    return { skipped: false, result };
  } catch (err) {
    console.error('[scheduler] Error executing monitoring cycle:', err.message);
    return { skipped: false, error: err.message };
  } finally {
    isJobRunning = false;
  }
}

/**
 * Starts the in-process timer. Safe to call multiple times (idempotent).
 */
export function startScheduler(options = {}) {
  if (isStarted) return;
  if (process.env.MONITORING_ENABLED === 'false') {
    console.log('[scheduler] Monitoring scheduler disabled via MONITORING_ENABLED=false');
    return;
  }

  const intervalMs = options.intervalMs || getSchedulerIntervalMs();
  isStarted = true;

  console.log(`[scheduler] In-process price refresh scheduler started (interval: ${(intervalMs / 3600000).toFixed(1)}h)`);

  // Run initial pass if requested
  if (options.runImmediately) {
    triggerScheduledCycle().catch(() => {});
  }

  intervalTimer = setInterval(async () => {
    await triggerScheduledCycle();
  }, intervalMs);

  // Prevent timer from holding process open during test or shutdown if unref supported
  if (intervalTimer && typeof intervalTimer.unref === 'function' && options.unref) {
    intervalTimer.unref();
  }
}

/**
 * Stops the in-process scheduler and cleans up timers.
 */
export function stopScheduler() {
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
  }
  isStarted = false;
  isJobRunning = false;
}

/**
 * Returns diagnostic state of scheduler.
 */
export function getSchedulerStatus() {
  return {
    isStarted,
    isJobRunning,
    intervalMs: getSchedulerIntervalMs(),
    intervalHours: getSchedulerIntervalMs() / 3600000,
    monitorState: getMonitorState(),
  };
}

export default {
  startScheduler,
  stopScheduler,
  triggerScheduledCycle,
  getSchedulerStatus,
  getSchedulerIntervalMs,
};
