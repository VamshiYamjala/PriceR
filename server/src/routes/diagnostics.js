// server/src/routes/diagnostics.js
import { Router } from 'express';
import { getAllDiagnostics, verifySource } from '../controllers/diagnosticsController.js';

const router = Router();

/**
 * Production Diagnostics Access Guard:
 * In development and test environments, diagnostics are fully available for testing and inspection.
 * In production, detailed diagnostics and provider-verification endpoints are disabled by default
 * to prevent leaking internal infrastructure, dependencies, or service topology.
 * Optional admin access in production requires a valid X-Diagnostic-Secret or X-Monitor-Secret header.
 */
export function protectProductionDiagnostics(req, res, next) {
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const providedSecret = req.headers['x-diagnostic-secret'] || req.headers['x-monitor-secret'];
  const allowedSecret = process.env.ADMIN_DIAGNOSTIC_SECRET || process.env.MONITOR_TRIGGER_SECRET;

  if (allowedSecret && providedSecret && providedSecret === allowedSecret) {
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
