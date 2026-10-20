// server/tests/monitorExecution.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';
import Alert from '../src/models/Alert.js';
import MonitorRun from '../src/models/MonitorRun.js';
import MonitorLock from '../src/models/MonitorLock.js';
import * as priceMonitorService from '../src/services/priceMonitor.js';

describe('Asynchronous Monitoring Execution & Run-Specific Status Lifecycle', () => {
  const hasDb = Boolean(process.env.MONGODB_URI);
  const JWT_SECRET = process.env.JWT_SECRET || 'ci-test-secret-at-least-32-characters-long';
  const MONITOR_SECRET = process.env.MONITOR_TRIGGER_SECRET || 'ci-monitor-secret-12345';

  let regularUser;
  let adminUser;
  let regularToken;
  let adminToken;

  beforeAll(async () => {
    jest.setTimeout(30000);
    if (!hasDb) return;
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    const ts = Date.now();
    regularUser = await User.create({
      name: 'Regular Test User',
      email: `reg_user_${ts}@example.com`,
      passwordHash: 'hash123456',
      role: 'user',
    });
    regularToken = jwt.sign({ sub: regularUser._id.toString(), role: 'user' }, JWT_SECRET, { expiresIn: '1h' });

    adminUser = await User.create({
      name: 'Admin Test User',
      email: `admin_user_${ts}@example.com`,
      passwordHash: 'hash123456',
      role: 'admin',
    });
    adminToken = jwt.sign({ sub: adminUser._id.toString(), role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    if (!hasDb) return;
    try {
      if (regularUser) await User.findByIdAndDelete(regularUser._id);
      if (adminUser) await User.findByIdAndDelete(adminUser._id);
      await MonitorRun.deleteMany({ triggeredBy: { $in: ['test', 'manual_api', 'github_actions'] } });
      await MonitorLock.deleteMany({});
      await mongoose.disconnect();
    } catch {
      // Ignore cleanup error
    }
  });

  beforeEach(async () => {
    if (hasDb && mongoose.connection.readyState === 1) {
      await MonitorRun.deleteMany({});
      await MonitorLock.deleteMany({});
    }
    priceMonitorService.setMonitorStateForTesting({
      isRunning: false,
      currentRunId: null,
      lastRunAt: null,
      lastRunOffersChecked: 0,
      lastRunErrors: 0,
    });
  });

  // 1. Fast Acknowledgement Test
  it('Promptly returns HTTP 202 with unique runId and running status without blocking', async () => {
    if (!hasDb) return;

    const start = Date.now();
    const res = await request(app)
      .post('/api/monitor/run')
      .set('X-Monitor-Secret', MONITOR_SECRET);

    const elapsed = Date.now() - start;

    expect(res.status).toBe(202);
    expect(res.body.success).toBe(true);
    expect(res.body.data.started).toBe(true);
    expect(res.body.data.status).toBe('running');
    expect(res.body.data.runId).toBeDefined();
    expect(mongoose.Types.ObjectId.isValid(res.body.data.runId)).toBe(true);
    // Must acknowledge promptly (under 1000ms)
    expect(elapsed).toBeLessThan(1000);

    // Verify document was created in MongoDB
    const runDoc = await MonitorRun.findById(res.body.data.runId);
    expect(runDoc).not.toBeNull();
    expect(runDoc.status).toBe('running');

    // Wait briefly for background cycle to complete
    await new Promise((r) => setTimeout(r, 600));
  });

  // 2. Duplicate Run Prevention (Local Mutex Test)
  it('Rejects overlapping trigger requests with HTTP 409 and avoids duplicate runs', async () => {
    if (!hasDb) return;

    // Simulate in-memory active lock
    priceMonitorService.setMonitorStateForTesting({
      isRunning: true,
      currentRunId: '6ad0540c9b19d2e6b68a97a0',
    });

    const res = await request(app)
      .post('/api/monitor/run')
      .set('X-Monitor-Secret', MONITOR_SECRET);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('OVERLAPPING_CYCLE');
    expect(res.body.error.runId).toBe('6ad0540c9b19d2e6b68a97a0');
  });

  // 3. Exact Run Status Lookup
  it('Returns accurate status for a specific runId via X-Monitor-Secret', async () => {
    if (!hasDb) return;

    const runDoc = await MonitorRun.create({
      status: 'completed',
      triggeredBy: 'manual_api',
      startedAt: new Date(Date.now() - 5000),
      completedAt: new Date(),
      durationMs: 5000,
      offersAttempted: 3,
      offersSuccessful: 2,
      offersFailed: 1,
      triggeredAlerts: 1,
      errors: [
        {
          offerId: new mongoose.Types.ObjectId(),
          provider: 'apify',
          message: 'Scraper rate limit exceeded',
        },
      ],
    });

    const res = await request(app)
      .get(`/api/monitor/runs/${runDoc._id}`)
      .set('X-Monitor-Secret', MONITOR_SECRET);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.runId).toBe(runDoc._id.toString());
    expect(res.body.data.status).toBe('completed');
    expect(res.body.data.offersAttempted).toBe(3);
    expect(res.body.data.offersSuccessful).toBe(2);
    expect(res.body.data.offersFailed).toBe(1);
    expect(res.body.data.triggeredAlerts).toBe(1);
    expect(res.body.data.errors.length).toBe(1);
    expect(res.body.data.errors[0].message).toBe('Scraper rate limit exceeded');
  });

  // 4. Authorization & Security Guard on Run Status
  it('Enforces security: regular user is forbidden (403), admin is authorized (200), no auth is unauthorized (401)', async () => {
    if (!hasDb) return;

    const runDoc = await MonitorRun.create({
      status: 'running',
      triggeredBy: 'manual_api',
      startedAt: new Date(),
    });

    // Case A: No credentials -> 401
    const noAuthRes = await request(app).get(`/api/monitor/runs/${runDoc._id}`);
    expect(noAuthRes.status).toBe(401);
    expect(noAuthRes.body.error.code).toBe('AUTH_REQUIRED');

    // Case B: Regular user JWT -> 403 Forbidden (protects system errors from normal users)
    const regularRes = await request(app)
      .get(`/api/monitor/runs/${runDoc._id}`)
      .set('Authorization', `Bearer ${regularToken}`);
    expect(regularRes.status).toBe(403);
    expect(regularRes.body.error.code).toBe('FORBIDDEN');

    // Case C: Admin user JWT -> 200 OK
    const adminRes = await request(app)
      .get(`/api/monitor/runs/${runDoc._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.data.runId).toBe(runDoc._id.toString());
  });

  // 5. Invalid / Non-Existent Run ID Validation
  it('Returns 400 for malformed run ID and 404 for non-existent run ID', async () => {
    if (!hasDb) return;

    // Malformed ID
    const badIdRes = await request(app)
      .get('/api/monitor/runs/invalid-hex-id')
      .set('X-Monitor-Secret', MONITOR_SECRET);
    expect(badIdRes.status).toBe(400);
    expect(badIdRes.body.error.code).toBe('INVALID_ID');

    // Non-existent valid ObjectId
    const missingId = new mongoose.Types.ObjectId();
    const notFoundRes = await request(app)
      .get(`/api/monitor/runs/${missingId}`)
      .set('X-Monitor-Secret', MONITOR_SECRET);
    expect(notFoundRes.status).toBe(404);
    expect(notFoundRes.body.error.code).toBe('NOT_FOUND');
  });

  // 6. Stale Run Reconciliation
  it('Reconciles orphaned runs older than threshold as interrupted without touching fresh runs', async () => {
    if (!hasDb) return;

    const oldDate = new Date(Date.now() - 20 * 60 * 1000); // 20 minutes ago
    const freshDate = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago

    const staleRun = await MonitorRun.create({
      status: 'running',
      triggeredBy: 'scheduler',
      startedAt: oldDate,
    });
    // Manually force updatedAt to oldDate
    await MonitorRun.collection.updateOne({ _id: staleRun._id }, { $set: { updatedAt: oldDate } });

    const activeRun = await MonitorRun.create({
      status: 'running',
      triggeredBy: 'github_actions',
      startedAt: freshDate,
    });

    const modifiedCount = await priceMonitorService.reconcileStaleRuns(15 * 60 * 1000);
    expect(modifiedCount).toBeGreaterThanOrEqual(1);

    const checkedStale = await MonitorRun.findById(staleRun._id);
    expect(checkedStale.status).toBe('interrupted');
    expect(checkedStale.failureReason).toContain('heartbeat expired');

    const checkedActive = await MonitorRun.findById(activeRun._id);
    expect(checkedActive.status).toBe('running');

    // Clean up
    await MonitorRun.findByIdAndDelete(staleRun._id);
    await MonitorRun.findByIdAndDelete(activeRun._id);
  });

  // 7. Mutex Recovery on Fatal Exception
  it('Guarantees mutex release and marks MonitorRun as failed on fatal runner exception', async () => {
    if (!hasDb) return;

    const runDoc = await MonitorRun.create({
      status: 'running',
      triggeredBy: 'manual_api',
      startedAt: new Date(),
    });

    const alertSpy = jest.spyOn(Alert, 'find').mockImplementationOnce(() => {
      throw new Error('Database cluster simulated crash');
    });

    try {
      await priceMonitorService.runMonitoringCycle({ runId: runDoc._id.toString(), force: true });
    } catch {
      // Expected to throw
    }

    // Mutex in priceMonitor should be freed in finally
    const state = priceMonitorService.getMonitorState();
    expect(state.isRunning).toBe(false);

    // Verify MonitorRun was updated to failed
    const updatedRun = await MonitorRun.findById(runDoc._id);
    expect(updatedRun.status).toBe('failed');
    expect(updatedRun.failureReason).toContain('Database cluster simulated crash');

    alertSpy.mockRestore();
  });

  // 8. Deterministic Cross-Instance Concurrency Test
  it('Deterministic cross-instance concurrency: when two competing instances request cycle simultaneously, only one starts', async () => {
    if (!hasDb) return;

    // Simulate two distinct backend instances executing simultaneously
    // by calling startMonitoringRun with distinct instance IDs concurrently
    const [resultA, resultB] = await Promise.all([
      priceMonitorService.startMonitoringRun({
        instanceId: 'render-backend-worker-instance-A',
        triggeredBy: 'github_actions',
      }),
      priceMonitorService.startMonitoringRun({
        instanceId: 'render-backend-worker-instance-B',
        triggeredBy: 'github_actions',
      }),
    ]);

    // Exactly one instance must succeed, and exactly one instance must be rejected
    const succeeded = [resultA, resultB].filter((r) => r.skipped === false);
    const rejected = [resultA, resultB].filter((r) => r.skipped === true);

    expect(succeeded.length).toBe(1);
    expect(rejected.length).toBe(1);

    expect(succeeded[0].status).toBe('running');
    expect(succeeded[0].runId).toBeDefined();

    expect(rejected[0].reason).toBe('OVERLAPPING_CYCLE');

    // Verify that in MongoDB, exactly ONE active MonitorRun document was created
    const activeRunsInDb = await MonitorRun.find({ status: 'running' });
    expect(activeRunsInDb.length).toBe(1);
    expect(activeRunsInDb[0]._id.toString()).toBe(succeeded[0].runId);

    // Verify MonitorLock document in MongoDB
    const lockDoc = await MonitorLock.findById('monitoring_cycle_lock');
    expect(lockDoc).not.toBeNull();
    expect(lockDoc.isLocked).toBe(true);
    expect(lockDoc.currentRunId.toString()).toBe(succeeded[0].runId);

    // Wait for the running cycle to complete cleanly
    await new Promise((r) => setTimeout(r, 600));

    // After completion, lock must be released
    const releasedLock = await MonitorLock.findById('monitoring_cycle_lock');
    expect(releasedLock.isLocked).toBe(false);
  });

  // 9. Periodic Heartbeat Touch Preservation
  it('touchLockHeartbeat refreshes heartbeat on MonitorLock without altering locked state', async () => {
    if (!hasDb) return;

    const runDoc = await MonitorRun.create({
      status: 'running',
      triggeredBy: 'test',
      startedAt: new Date(Date.now() - 10000),
    });

    await MonitorLock.create({
      _id: 'monitoring_cycle_lock',
      isLocked: true,
      currentRunId: runDoc._id,
      acquiredAt: new Date(Date.now() - 10000),
      heartbeatAt: new Date(Date.now() - 10000),
      instanceId: 'worker-1',
    });

    const beforeTouch = await MonitorLock.findById('monitoring_cycle_lock');
    const oldHeartbeat = beforeTouch.heartbeatAt.getTime();

    // Small delay then touch
    await new Promise((r) => setTimeout(r, 50));
    await priceMonitorService.touchLockHeartbeat(runDoc._id);

    const afterTouch = await MonitorLock.findById('monitoring_cycle_lock');
    expect(afterTouch.heartbeatAt.getTime()).toBeGreaterThan(oldHeartbeat);
    expect(afterTouch.isLocked).toBe(true);
  });

  // 10. Disabled Monitoring Cleanup
  it('When MONITORING_ENABLED=false, startMonitoringRun safely completes, releases distributed lock and does not leave running status', async () => {
    if (!hasDb) return;

    const originalEnabled = process.env.MONITORING_ENABLED;
    process.env.MONITORING_ENABLED = 'false';

    try {
      const res = await priceMonitorService.startMonitoringRun({
        instanceId: 'test-disabled-cleanup-instance',
        triggeredBy: 'test',
        force: false,
      });

      expect(res.skipped).toBe(false);
      expect(res.runId).toBeDefined();

      // Wait briefly for background execution to complete
      await new Promise((r) => setTimeout(r, 500));

      // 1. Mutex must be freed
      const state = priceMonitorService.getMonitorState();
      expect(state.isRunning).toBe(false);

      // 2. Distributed lock must be released
      const lockDoc = await MonitorLock.findById('monitoring_cycle_lock');
      expect(lockDoc).not.toBeNull();
      expect(lockDoc.isLocked).toBe(false);

      // 3. MonitorRun must not remain in running state
      const runDoc = await MonitorRun.findById(res.runId);
      expect(runDoc).not.toBeNull();
      expect(runDoc.status).toBe('completed');
      expect(runDoc.failureReason).toContain('MONITORING_ENABLED is set to false');
    } finally {
      process.env.MONITORING_ENABLED = originalEnabled;
    }
  });

  // 11. Forced Trigger Execution
  it('When MONITORING_ENABLED=false, force: true forces full cycle execution', async () => {
    if (!hasDb) return;

    const originalEnabled = process.env.MONITORING_ENABLED;
    process.env.MONITORING_ENABLED = 'false';

    try {
      const result = await priceMonitorService.runMonitoringCycle({ force: true });
      expect(result.skipped).toBe(false);
      expect(result.disabled).toBeUndefined();
    } finally {
      process.env.MONITORING_ENABLED = originalEnabled;
    }
  });

  // 12. Overlapping Request Rejection Does Not Release Another Cycle's Lock
  it('A request rejected with OVERLAPPING_CYCLE cannot release or overwrite the active cycle lock', async () => {
    if (!hasDb) return;

    // Start primary run
    const primary = await priceMonitorService.startMonitoringRun({
      instanceId: 'primary-worker',
      triggeredBy: 'github_actions',
      force: true,
    });
    expect(primary.skipped).toBe(false);

    // Attempt overlapping run
    const overlapping = await priceMonitorService.startMonitoringRun({
      instanceId: 'intruder-worker',
      triggeredBy: 'manual_api',
    });
    expect(overlapping.skipped).toBe(true);
    expect(overlapping.reason).toBe('OVERLAPPING_CYCLE');

    // Verify primary lock is STILL held by primary runId
    const lockDuringRun = await MonitorLock.findById('monitoring_cycle_lock');
    expect(lockDuringRun.isLocked).toBe(true);
    expect(lockDuringRun.currentRunId.toString()).toBe(primary.runId);

    // Wait for primary to complete
    await new Promise((r) => setTimeout(r, 600));

    // After primary completes, lock is safely released
    const lockAfter = await MonitorLock.findById('monitoring_cycle_lock');
    expect(lockAfter.isLocked).toBe(false);
  });
});
