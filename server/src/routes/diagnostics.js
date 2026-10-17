// server/src/routes/diagnostics.js
import { Router } from 'express';
import { getAllDiagnostics, verifySource } from '../controllers/diagnosticsController.js';

const router = Router();

/**
 * Production Diagnostics Access Guard:
 * In development and test environments, diagnostics are fully available for testing and inspection.
 * In production, detailed diagnostics and provider-verification endpoints are disabled by default
 * to prevent leaking internal infrastructure, dependencies, or service topology.
 * Admin access in production requires a dedicated X-Diagnostic-Secret header matching ADMIN_DIAGNOSTIC_SECRET.
 * MONITOR_TRIGGER_SECRET is strictly forbidden from unlocking diagnostics.
 */
export function protectProductionDiagnostics(req, res, next) {
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const providedSecret = req.headers['x-diagnostic-secret'];
  const adminSecret = process.env.ADMIN_DIAGNOSTIC_SECRET;

  if (adminSecret && providedSecret && providedSecret === adminSecret) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: {
      code: 'DIAGNOSTICS_DISABLED',
      message: 'Detailed diagnostics are disabled in production for security. System health remains available at /api/health.',
    },
  });
}

// Protect all diagnostic routes in production
router.use(protectProductionDiagnostics);

// Run all safe system diagnostic checks across categories A through I
router.get('/', getAllDiagnostics);
router.get('/summary', getAllDiagnostics);

// Deep source verification (eBay, Apify)
router.get('/sources/:sourceId', verifySource);
router.post('/sources/:sourceId/verify', verifySource);

export default router;
