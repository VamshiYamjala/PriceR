// server/src/routes/monitor.js
// Owner: Member 1
// Protected monitoring endpoints (Document 1 Section 6.6)

import { Router } from 'express';
import { runMonitor, getMonitorStatus, triggerUserMonitor } from '../controllers/monitorController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Endpoint called by GitHub Actions workflow (.github/workflows/monitor.yml)
// Protected by X-Monitor-Secret header — returns HTTP 202
router.post('/run', runMonitor);

// Status endpoint inspected by logged-in team members
// Protected by user JWT — returns HTTP 200
router.get('/status', requireAuth, getMonitorStatus);

// On-demand refresh endpoint triggered by logged-in users from the dashboard/alerts UI
// Protected by user JWT — returns HTTP 200
router.post('/trigger', requireAuth, triggerUserMonitor);

export default router;
