// server/src/controllers/monitorController.js
// Owner: Member 1
// Protected monitoring trigger & status handlers. Document 1 Section 6.6.

import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  startMonitoringRun,
  runMonitoringCycle,
  getMonitorState,
} from '../services/priceMonitor.js';
import MonitorRun from '../models/MonitorRun.js';
import User from '../models/User.js';

/**
 * Triggers a price monitoring cycle asynchronously.
 * Protected by X-Monitor-Secret shared secret.
 * Immediately responds with HTTP 202 Accepted and a unique runId.
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

  const results = await startMonitoringRun({
    triggeredBy: 'github_actions',
    force: process.env.NODE_ENV !== 'test',
  });

  if (results.skipped) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'OVERLAPPING_CYCLE',
        message: 'A price monitoring cycle is already in progress.',
        runId: results.currentRunId || null,
      },
    });
  }

  return res.status(202).json({
    success: true,
    data: {
      started: true,
      runId: results.runId,
      status: results.status,
      offersChecked: 0,
      triggeredAlerts: 0,
      startedAt: results.startedAt ? results.startedAt.toISOString() : new Date().toISOString(),
      message: 'Price monitoring cycle accepted and started in background.',
    },
  });
});

/**
 * Retrieves the status of a specific monitoring run by runId.
 * Protected by X-Monitor-Secret or administrator authorization.
 * Never exposes operational errors or system IDs to arbitrary regular users.
 */
export const getMonitorRunStatus = asyncHandler(async (req, res) => {
  const { runId } = req.params;

  // Authorization check: monitor secret, diagnostic secret, or admin role
  const secretHeader = req.headers['x-monitor-secret'];
  const expectedSecret = process.env.MONITOR_TRIGGER_SECRET;
  const isSecretValid = Boolean(expectedSecret && secretHeader === expectedSecret);

  const diagSecret = req.headers['x-diagnostic-secret'];
  const expectedDiagSecret = process.env.ADMIN_DIAGNOSTIC_SECRET;
  const isDiagSecretValid = Boolean(expectedDiagSecret && diagSecret === expectedDiagSecret);

  let isUserAdmin = false;
  if (req.user && req.user.id) {
    if (req.user.role === 'admin') {
      isUserAdmin = true;
    } else if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findById(req.user.id);
        if (user && user.role === 'admin') {
          isUserAdmin = true;
        }
      } catch {
        // Ignore DB error
      }
    }
  }

  if (!isSecretValid && !isDiagSecretValid && !isUserAdmin) {
    if (req.user) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Admin access or valid X-Monitor-Secret required to inspect run details.' },
      });
    }
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_REQUIRED', message: 'Valid X-Monitor-Secret or admin authorization required.' },
    });
  }

  if (!mongoose.Types.ObjectId.isValid(runId)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_ID', message: 'Invalid run ID format.' },
    });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: { code: 'DATABASE_UNAVAILABLE', message: 'Database is currently unreachable.' },
    });
  }

  const run = await MonitorRun.findById(runId);
  if (!run) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Monitoring run not found.' },
    });
  }

  return res.status(200).json({
    success: true,
    data: run.toPublicJSON(),
  });
});

/**
 * Retrieves the overall status of the price monitor.
 * Requires either X-Monitor-Secret or user authentication.
 */
export const getMonitorStatus = asyncHandler(async (req, res) => {
  const secretHeader = req.headers['x-monitor-secret'];
  const expectedSecret = process.env.MONITOR_TRIGGER_SECRET;
  const isSecretValid = Boolean(expectedSecret && secretHeader === expectedSecret);

  let isUserAdmin = false;
  if (req.user && req.user.id) {
    if (req.user.role === 'admin') {
      isUserAdmin = true;
    } else if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findById(req.user.id);
        if (user && user.role === 'admin') {
          isUserAdmin = true;
        }
      } catch {
        // Ignore DB error
      }
    }
  }

  if (!isSecretValid && !isUserAdmin && !req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required.' },
    });
  }

  const state = getMonitorState();
  const responseData = {
    lastRunAt: state.lastRunAt,
    lastRunOffersChecked: state.lastRunOffersChecked,
    lastRunErrors: state.lastRunErrors,
  };

  if ((isSecretValid || isUserAdmin) && mongoose.connection.readyState === 1) {
    try {
      const latestRun = await MonitorRun.findOne().sort({ startedAt: -1 });
      if (latestRun) {
        responseData.latestRun = latestRun.toPublicJSON();
      }
    } catch {
      // Ignore DB error
    }
  }

  return res.status(200).json({
    success: true,
    data: responseData,
  });
});

export const triggerUserMonitor = asyncHandler(async (req, res) => {
  // Manual trigger from UI operates on demand in production/development,
  // while in unit tests (NODE_ENV=test) it obeys MONITORING_ENABLED=false unless explicitly forced
  const results = await runMonitoringCycle({
    triggeredBy: 'user',
    force: process.env.NODE_ENV !== 'test',
  });

  if (results.skipped) {
    return res.status(409).json({
      success: false,
      error: { code: 'OVERLAPPING_CYCLE', message: 'A price monitoring cycle is already in progress.' },
    });
  }

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

export default { runMonitor, getMonitorStatus, getMonitorRunStatus, triggerUserMonitor };
