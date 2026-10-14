// server/src/controllers/monitorController.js
// Owner: Member 1
// Protected monitoring trigger handler. Document 1 Section 6.6.

import { asyncHandler } from '../utils/asyncHandler.js';
import { runMonitoringCycle } from '../services/priceMonitor.js';

export const runMonitor = asyncHandler(async (req, res) => {
  const secretHeader = req.headers['x-monitor-secret'];
  const expectedSecret = process.env.MONITOR_TRIGGER_SECRET;

  if (!expectedSecret || secretHeader !== expectedSecret) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Invalid or missing X-Monitor-Secret.' },
    });
  }

  const results = await runMonitoringCycle();

  return res.status(200).json({
    success: true,
    data: {
      started: true,
      offersChecked: results.offersChecked,
      triggeredAlerts: results.triggeredAlerts,
    },
  });
});

export default { runMonitor };
