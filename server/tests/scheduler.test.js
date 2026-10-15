import {
  startScheduler,
  stopScheduler,
  triggerScheduledCycle,
  getSchedulerStatus,
  getSchedulerIntervalMs,
} from '../src/services/scheduler.js';

describe('In-Process Scheduler Service (Phase B & 4-Hour Refreshes)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    stopScheduler();
  });

  afterAll(() => {
    stopScheduler();
    process.env = originalEnv;
  });

  it('getSchedulerIntervalMs() should default to 4 hours (14,400,000 ms)', () => {
    delete process.env.MONITOR_INTERVAL_MS;
    delete process.env.MONITOR_INTERVAL_HOURS;
    const interval = getSchedulerIntervalMs();
    expect(interval).toBe(4 * 60 * 60 * 1000);
  });

  it('getSchedulerIntervalMs() should parse MONITOR_INTERVAL_HOURS correctly', () => {
    process.env.MONITOR_INTERVAL_HOURS = '2.5';
    expect(getSchedulerIntervalMs()).toBe(2.5 * 3600 * 1000);
  });

  it('getSchedulerIntervalMs() should prioritize MONITOR_INTERVAL_MS when present', () => {
    process.env.MONITOR_INTERVAL_MS = '60000';
    process.env.MONITOR_INTERVAL_HOURS = '8';
    expect(getSchedulerIntervalMs()).toBe(60000);
  });

  it('startScheduler() should initialize scheduler and report status', () => {
    process.env.MONITORING_ENABLED = 'true';
    startScheduler({ intervalMs: 3600000 });
    const status = getSchedulerStatus();
    expect(status.isStarted).toBe(true);
    expect(status.isJobRunning).toBe(false);
  });

  it('triggerScheduledCycle() should prevent overlapping monitoring cycles', async () => {
    let resolveMonitor;
    const longRunningPromise = new Promise((resolve) => {
      resolveMonitor = resolve;
    });

    const mockRunner = () => longRunningPromise;

    // Trigger first cycle (runs in background)
    const firstCyclePromise = triggerScheduledCycle(mockRunner);

    // Trigger concurrent cycle while first is still running
    const secondCycle = await triggerScheduledCycle(mockRunner);
    expect(secondCycle.skipped).toBe(true);
    expect(secondCycle.reason).toBe('OVERLAPPING_CYCLE');

    // Finish first cycle
    resolveMonitor({ offersChecked: 2, triggeredAlerts: 0, errors: 0 });
    const firstCycle = await firstCyclePromise;
    expect(firstCycle.skipped).toBe(false);
    expect(firstCycle.result.offersChecked).toBe(2);
  });

  it('triggerScheduledCycle() should catch errors gracefully without throwing', async () => {
    const errorRunner = async () => {
      throw new Error('Network glitch');
    };
    const result = await triggerScheduledCycle(errorRunner);
    expect(result.skipped).toBe(false);
    expect(result.error).toBe('Network glitch');
  });

  it('stopScheduler() should clear active timers and reset state', () => {
    startScheduler({ intervalMs: 10000 });
    expect(getSchedulerStatus().isStarted).toBe(true);
    stopScheduler();
    expect(getSchedulerStatus().isStarted).toBe(false);
  });
});
