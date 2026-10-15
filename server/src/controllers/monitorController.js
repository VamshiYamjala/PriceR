// server/src/controllers/monitorController.js
// Owner: Member 1
// Protected monitoring trigger & status handlers. Document 1 Section 6.6.

import { asyncHandler } from '../utils/asyncHandler.js';
import { runMonitoringCycle, getMonitorState } from '../services/priceMonitor.js';

/**
 * Triggers a price monitoring cycle. Protected by X-Monitor-Secret shared secret.
 * Responds with HTTP 202 Accepted per Document 1 Section 6.6 contract.
 */
export const runMonitor = asyncHandler(async (req, res) => {
  const secretHeader = req.headers['x-monitor-secret'];
  const expectedSecret = process.env.MONITOR_TRIGGER_SECRET;

  if (!expectedSecret || secretHeader !== expectedSecret) {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_INVALID', message: 'Invalid or missing X-Monitor-Secret.' },
    });
  }

  const results = await runMonitoringCycle();

  return res.status(202).json({
    success: true,
    data: {
      started: true,
      offersChecked: results.offersChecked,
      triggeredAlerts: results.triggeredAlerts,
    },
  });
});

/**
 * Retrieves the status of the price monitor.
 * Requires logged-in user authentication per Document 1 Section 6.6 contract.
 */
export const getMonitorStatus = asyncHandler(async (req, res) => {
  const state = getMonitorState();

  return res.status(200).json({
    success: true,
    data: {
      lastRunAt: state.lastRunAt,
      lastRunOffersChecked: state.lastRunOffersChecked,
      lastRunErrors: state.lastRunErrors,
    },
  });
});

export const triggerUserMonitor = asyncHandler(async (req, res) => {
  const results = await runMonitoringCycle();

  return res.status(200).json({
    success: true,
    data: {
      offersChecked: results.offersChecked,
      triggeredAlerts: results.triggeredAlerts,
      errors: results.errors,
      completedAt: new Date().toISOString(),
    },
  });
});

export default { runMonitor, getMonitorStatus, triggerUserMonitor };
