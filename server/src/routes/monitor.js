// server/src/routes/monitor.js
// Owner: Member 1
// Protected monitoring endpoints (Document 1 Section 6.6)

import { Router } from 'express';
import {
  runMonitor,
  getMonitorStatus,
  getMonitorRunStatus,
  triggerUserMonitor,
} from '../controllers/monitorController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Endpoint called by GitHub Actions workflow (.github/workflows/monitor.yml)
// Protected by X-Monitor-Secret header — returns HTTP 202 Accepted with runId
router.post('/run', runMonitor);

// Status lookup for a specific run ID polled by GitHub Actions or inspected by administrators
// Protected by X-Monitor-Secret or admin authorization — returns HTTP 200
router.get('/runs/:runId', optionalAuth, getMonitorRunStatus);

// Overall status endpoint inspected by monitor secret or logged-in users
// Returns HTTP 200
router.get('/status', optionalAuth, getMonitorStatus);

// On-demand refresh endpoint triggered by logged-in users from the dashboard/alerts UI
// Protected by user JWT — returns HTTP 200
router.post('/trigger', requireAuth, triggerUserMonitor);

export default router;
