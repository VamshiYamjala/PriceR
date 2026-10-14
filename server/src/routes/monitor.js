// server/src/routes/monitor.js
// Owner: Member 1
// Protected trigger endpoint for scheduled price monitoring.

import { Router } from 'express';
import { runMonitor } from '../controllers/monitorController.js';

const router = Router();

// Endpoint called by GitHub Actions (.github/workflows/monitor.yml)
router.post('/run', runMonitor);

export default router;
