// server/src/routes/diagnostics.js
import { Router } from 'express';
import { getAllDiagnostics, verifySource } from '../controllers/diagnosticsController.js';

const router = Router();

// Run all safe system diagnostic checks across categories A through I
router.get('/', getAllDiagnostics);
router.get('/summary', getAllDiagnostics);

// Deep source verification (eBay, Apify)
router.get('/sources/:sourceId', verifySource);
router.post('/sources/:sourceId/verify', verifySource);

export default router;
