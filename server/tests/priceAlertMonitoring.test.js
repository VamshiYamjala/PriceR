// server/tests/priceAlertMonitoring.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Offer from '../src/models/Offer.js';
import Alert from '../src/models/Alert.js';
import PriceObservation from '../src/models/PriceObservation.js';
import NotificationEvent from '../src/models/NotificationEvent.js';
import providerDispatcher from '../src/providers/index.js';
import axios from 'axios';
import * as apifyModule from '../src/providers/apify.js';
import emailService from '../src/services/notifications/email.js';
import telegramService from '../src/services/notifications/telegram.js';
import { evaluateNotificationCompletion } from '../src/services/alertDispatcher.js';
import { runMonitoringCycle, getMonitorState, setMonitorStateForTesting } from '../src/services/priceMonitor.js';
import { getSchedulerIntervalMs, triggerScheduledCycle } from '../src/services/scheduler.js';
import { evaluateAlert } from '../src/services/alertEvaluator.js';

describe('Price Alert Monitoring & Scheduler End-to-End Regression Suite (17 Conditions)', () => {
  const hasDb = Boolean(process.env.MONGODB_URI);
  const JWT_SECRET = process.env.JWT_SECRET || 'ci-test-secret-at-least-32-characters-long';
  const MONITOR_SECRET = process.env.MONITOR_TRIGGER_SECRET || 'ci-monitor-secret-12345';

  let testUser;
  let testToken;
  let testProduct;
  let testOffer;

  let sendEmailSpy;
  let sendTelegramSpy;

  beforeAll(async () => {
    jest.setTimeout(25000);
    if (!hasDb) return;
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Mock notification services so no real emails or telegram messages are dispatched
    sendEmailSpy = jest.spyOn(emailService, 'sendEmail').mockResolvedValue({
      success: true,
      providerMessageId: 'mock-brevo-alert-msg',
    });

    sendTelegramSpy = jest.spyOn(telegramService, 'sendMessage').mockResolvedValue({
      success: true,
      messageId: 'mock-tg-msg-id',
    });

    // Create test user
    const ts = Date.now();
    testUser = await User.create({
      name: 'Monitor Test User',
      email: `monitor_test_${ts}@example.com`,
      passwordHash: 'hash123456',
      telegramChatId: '987654321',
    });
    testToken = jwt.sign({ sub: testUser._id.toString() }, JWT_SECRET, { expiresIn: '1h' });

    testProduct = await Product.create({
      title: 'Sony WH-1000XM5 Headphones',
      canonicalKey: `test-headphones-${ts}`,
      brand: 'Sony',
      model: 'WH-1000XM5',
      category: 'Audio',
      sourceProvider: 'apify',
    });

    testOffer = await Offer.create({
      productId: testProduct._id,
      provider: 'apify',
      retailer: 'amazon',
      externalProductId: `amazon-B09XS7JWHH-${ts}`,
      title: 'Sony WH-1000XM5 Wireless Headphones',
      productUrl: 'https://www.amazon.in/dp/B09XS7JWHH',
      priceInPaise: 2999000, // ₹29,990
      currency: 'INR',
      availability: 'in_stock',
      isSample: false,
      dataStatus: 'live',
      lastStatus: 'ok',
    });
  });

  afterAll(async () => {
    if (sendEmailSpy) sendEmailSpy.mockRestore();
    if (sendTelegramSpy) sendTelegramSpy.mockRestore();

    if (!hasDb) return;
    try {
      if (testUser) await User.findByIdAndDelete(testUser._id);
      if (testProduct) await Product.findByIdAndDelete(testProduct._id);
      if (testOffer) {
        await Offer.findByIdAndDelete(testOffer._id);
        await Alert.deleteMany({ offerId: testOffer._id });
        await PriceObservation.deleteMany({ offerId: testOffer._id });
        await NotificationEvent.deleteMany({ offerId: testOffer._id });
      }
    } catch (_) {}

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  beforeEach(() => {
    setMonitorStateForTesting({ isRunning: false, lastRunErrors: 0 });
  });

  // 1 & 2: Target Price Alert evaluation
  it('Condition 1 & 2: Target-price alert triggers when price drops to/below target, does not trigger when above', async () => {
    const alert = {
      _id: new mongoose.Types.ObjectId(),
      type: 'target_price',
      targetPriceInPaise: 2500000, // Target: ₹25,000
      status: 'active',
      armed: true,
    };

    // Above target: ₹28,000 -> no alert
    const evalAbove = evaluateAlert(alert, 2800000);
    expect(evalAbove.conditionMet).toBe(false);
    expect(evalAbove.shouldNotify).toBe(false);

    // At target: ₹25,000 -> triggers
    const evalAt = evaluateAlert(alert, 2500000);
    expect(evalAt.conditionMet).toBe(true);
    expect(evalAt.shouldNotify).toBe(true);

    // Below target: ₹24,000 -> triggers
    const evalBelow = evaluateAlert(alert, 2400000);
    expect(evalBelow.conditionMet).toBe(true);
    expect(evalBelow.shouldNotify).toBe(true);
  });

  // 3: Fixed Drop Alert uses creation baseline or prior observation
  it('Condition 3: Fixed-drop alert uses durable baselinePriceInPaise reference from creation', async () => {
    const alertWithBaseline = {
      _id: new mongoose.Types.ObjectId(),
      type: 'fixed_drop',
      dropAmountInPaise: 300000, // ₹3,000 drop required
      baselinePriceInPaise: 3000000, // Baseline: ₹30,000
      status: 'active',
      armed: true,
    };

    // Current price is ₹28,000. Prior cycle observation was ₹29,000.
    // Drop from creation baseline (₹30,000 - ₹28,000 = ₹2,000 < ₹3,000 threshold) -> does NOT trigger yet
    const eval1 = evaluateAlert(alertWithBaseline, 2800000, 2900000);
    expect(eval1.conditionMet).toBe(false);

    // Later cycle: Price drops to ₹26,500. Prior cycle observation was ₹27,000 (only ₹500 drop between successive cycles).
    // But from creation baseline (₹30,000 - ₹26,500 = ₹3,500 >= ₹3,000 threshold) -> TRIGGERS correctly!
    const eval2 = evaluateAlert(alertWithBaseline, 2650000, 2700000);
    expect(eval2.conditionMet).toBe(true);
    expect(eval2.shouldNotify).toBe(true);
    expect(eval2.reason).toContain('dropped by ₹3500');
  });

  // 4: Product price change persistence
  it('Condition 4: Successful price refresh persists updated price to Offer and adds a PriceObservation', async () => {
    if (!hasDb) return;

    const fetchSpy = jest.spyOn(providerDispatcher, 'fetchOffer').mockImplementation(async (offer) => {
      if (offer._id?.toString() === testOffer._id.toString()) {
        return {
          provider: 'apify',
          externalProductId: testOffer.externalProductId,
          success: true,
          priceInPaise: 2799000, // New price: ₹27,990
          availability: 'in_stock',
          fetchedAt: new Date().toISOString(),
        };
      }
      return { success: false, errorMessage: 'skipped other offers in test' };
    });

    // Create an alert on testOffer to ensure it is included in cycle
    const alert = await Alert.create({
      userId: testUser._id,
      offerId: testOffer._id,
      type: 'target_price',
      targetPriceInPaise: 2500000,
      channels: ['email'],
      status: 'active',
      armed: true,
    });

    const result = await runMonitoringCycle({ force: true });
    expect(result.offersChecked).toBeGreaterThanOrEqual(1);

    const updatedOffer = await Offer.findById(testOffer._id);
    expect(updatedOffer.priceInPaise).toBe(2799000);
    expect(updatedOffer.lastStatus).toBe('ok');

    const observation = await PriceObservation.findOne({ offerId: testOffer._id, priceInPaise: 2799000 });
    expect(observation).not.toBeNull();
    expect(observation.status).toBe('success');

    await Alert.findByIdAndDelete(alert._id);
    fetchSpy.mockRestore();
  });

  // 5: Failed provider request creates failure observation and leaves last successful price untouched
  it('Condition 5: Failed provider request records failure observation without overwriting last price', async () => {
    if (!hasDb) return;

    const fetchSpy = jest.spyOn(providerDispatcher, 'fetchOffer').mockImplementation(async (offer) => {
      if (offer._id?.toString() === testOffer._id.toString()) {
        return {
          provider: 'apify',
          externalProductId: testOffer.externalProductId,
          success: false,
          errorMessage: 'Network timeout scraping Amazon listing',
          fetchedAt: new Date().toISOString(),
        };
      }
      return { success: false, errorMessage: 'skipped other offers in test' };
    });

    const alert = await Alert.create({
      userId: testUser._id,
      offerId: testOffer._id,
      type: 'target_price',
      targetPriceInPaise: 2000000,
      channels: ['email'],
      status: 'active',
      armed: true,
    });

    const priceBefore = (await Offer.findById(testOffer._id)).priceInPaise;
    const result = await runMonitoringCycle({ force: true });
    expect(result.errors).toBeGreaterThanOrEqual(1);

    const offerAfter = await Offer.findById(testOffer._id);
    // Price must remain completely intact!
    expect(offerAfter.priceInPaise).toBe(priceBefore);
    expect(offerAfter.lastStatus).toBe('error');
    expect(offerAfter.lastError).toContain('Network timeout');

    // Failure observation recorded
    const failObs = await PriceObservation.findOne({
      offerId: testOffer._id,
      status: 'failure',
      errorMessage: 'Network timeout scraping Amazon listing',
    });
    expect(failObs).not.toBeNull();

    await Alert.findByIdAndDelete(alert._id);
    fetchSpy.mockRestore();
  });

  // 6 & 7: Live offer does not refresh from fixtures or unrelated data
  it('Condition 6 & 7: Live offers dispatch to genuine providers and live flipkart offers reject fixture fallback', async () => {
    const liveFlipkartOffer = {
      provider: 'flipkart',
      externalProductId: 'FK-LIVE-TEST-123',
      isSample: false,
      dataStatus: 'live',
    };

    const res = await providerDispatcher.fetchOffer(liveFlipkartOffer);
    // Live Flipkart listing must NOT return fixture data
    expect(res.success).toBe(false);
    expect(res.errorMessage).toContain('Live Flipkart affiliate API is not configured');
    expect(res.isSample).toBeUndefined();

    // Sample offer is explicitly routed to fixture provider
    const sampleOffer = {
      provider: 'flipkart',
      externalProductId: 'FLP-SGM14-128-SLV',
      isSample: true,
    };
    const sampleRes = await providerDispatcher.fetchOffer(sampleOffer);
    expect(sampleRes.isSample).toBe(true);
  });

  // 8: Invalid and cross-currency price protection
  it('Condition 8: Rejects invalid, non-positive, or cross-currency price comparisons', async () => {
    const alert = {
      _id: new mongoose.Types.ObjectId(),
      type: 'target_price',
      targetPriceInPaise: 100000,
      status: 'active',
      armed: true,
    };

    // Zero price
    expect(evaluateAlert(alert, 0).conditionMet).toBe(false);
    // Negative price
    expect(evaluateAlert(alert, -100).conditionMet).toBe(false);
    // NaN
    expect(evaluateAlert(alert, NaN).conditionMet).toBe(false);

    // Cross-currency mismatch: item is in USD ($10 = 1000 cents), target is in INR (₹1000)
    const crossCurrency = evaluateAlert(alert, 1000, null, {
      currency: 'USD',
      targetCurrency: 'INR',
    });
    expect(crossCurrency.conditionMet).toBe(false);
    expect(crossCurrency.reason).toContain('Currency mismatch');
  });

  // 9 & 10: Duplicate notification suppression and re-arming
  it('Condition 9 & 10: Suppresses duplicate notifications while condition persists, re-arms when price rises', async () => {
    const alert = {
      _id: new mongoose.Types.ObjectId(),
      type: 'target_price',
      targetPriceInPaise: 2000000, // ₹20,000 target
      status: 'active',
      armed: true,
    };

    // First time price drops to ₹18,000 -> Should notify
    const firstHit = evaluateAlert(alert, 1800000);
    expect(firstHit.shouldNotify).toBe(true);

    // Alert becomes disarmed after notification
    alert.armed = false;

    // Second cycle: price is still ₹18,000 -> Condition is met but should NOT notify again (duplicate suppressed)
    const secondHit = evaluateAlert(alert, 1800000);
    expect(secondHit.conditionMet).toBe(true);
    expect(secondHit.shouldNotify).toBe(false);
    expect(secondHit.shouldRearm).toBe(false);

    // Third cycle: price rises to ₹22,000 -> Condition is no longer met, should re-arm!
    const priceRise = evaluateAlert(alert, 2200000);
    expect(priceRise.conditionMet).toBe(false);
    expect(priceRise.shouldRearm).toBe(true);

    // Re-armed
    alert.armed = true;

    // Fourth cycle: price drops back down to ₹19,000 -> Notifies again!
    const fourthHit = evaluateAlert(alert, 1900000);
    expect(fourthHit.shouldNotify).toBe(true);
  });

  // 11: NotificationEvent records audit logs
  it('Condition 11: NotificationEvent audit log is recorded when alert triggers', async () => {
    if (!hasDb) return;

    const fetchSpy = jest.spyOn(providerDispatcher, 'fetchOffer').mockImplementation(async (offer) => {
      if (offer._id?.toString() === testOffer._id.toString()) {
        return {
          provider: 'apify',
          externalProductId: testOffer.externalProductId,
          success: true,
          priceInPaise: 1500000, // Large drop to ₹15,000
          availability: 'in_stock',
          fetchedAt: new Date().toISOString(),
        };
      }
      return { success: false, errorMessage: 'skipped other offers in test' };
    });

    const alert = await Alert.create({
      userId: testUser._id,
      offerId: testOffer._id,
      type: 'target_price',
      targetPriceInPaise: 2000000,
      channels: ['email'],
      status: 'active',
      armed: true,
    });

    const res = await runMonitoringCycle({ force: true });
    expect(res.triggeredAlerts).toBe(1);

    const event = await NotificationEvent.findOne({ alertId: alert._id });
    expect(event).not.toBeNull();
    expect(event.channel).toBe('email');
    expect(event.status).toBe('sent');

    await Alert.findByIdAndDelete(alert._id);
    fetchSpy.mockRestore();
  });

  // 12: Schedule calculation is 4 hours (14,400,000 ms)
  it('Condition 12: getSchedulerIntervalMs defaults to 4 hours (14,400,000 ms)', () => {
    delete process.env.MONITOR_INTERVAL_MS;
    delete process.env.MONITOR_INTERVAL_HOURS;
    const interval = getSchedulerIntervalMs();
    expect(interval).toBe(4 * 60 * 60 * 1000); // 14,400,000 ms
  });

  // 13: MONITORING_ENABLED=false disables in-process run unless forced
  it('Condition 13: MONITORING_ENABLED=false skips execution unless forced', async () => {
    const originalSetting = process.env.MONITORING_ENABLED;
    process.env.MONITORING_ENABLED = 'false';

    const unforced = await runMonitoringCycle();
    expect(unforced.offersChecked).toBe(0);

    const forced = await runMonitoringCycle({ force: true });
    expect(forced.skipped).toBe(false);

    process.env.MONITORING_ENABLED = originalSetting;
  });

  // 14: Protected endpoint rejects missing or invalid secret with 401
  it('Condition 14: POST /api/monitor/run rejects unauthorized requests with 401', async () => {
    const resNoAuth = await request(app).post('/api/monitor/run');
    expect(resNoAuth.statusCode).toBe(401);
    expect(resNoAuth.body.error.code).toBe('AUTH_INVALID');

    const resBadAuth = await request(app)
      .post('/api/monitor/run')
      .set('X-Monitor-Secret', 'wrong-secret');
    expect(resBadAuth.statusCode).toBe(401);
  });

  // 15: Overlapping monitoring cycles are prevented
  it('Condition 15: Handles overlapping cycles safely without duplicate processing', async () => {
    setMonitorStateForTesting({ isRunning: true });

    const res = await runMonitoringCycle({ force: true });
    expect(res.skipped).toBe(true);
    expect(res.reason).toBe('OVERLAPPING_CYCLE');

    // Also via HTTP endpoint
    const httpRes = await request(app)
      .post('/api/monitor/run')
      .set('X-Monitor-Secret', MONITOR_SECRET);
    expect(httpRes.statusCode).toBe(409);
    expect(httpRes.body.error.code).toBe('OVERLAPPING_CYCLE');

    setMonitorStateForTesting({ isRunning: false });
  });

  // 16: Controller and API response contract reporting
  it('Condition 16: POST /api/monitor/run acknowledges promptly with runId and records metrics on run status endpoint', async () => {
    if (!hasDb) return;

    const res = await request(app)
      .post('/api/monitor/run')
      .set('X-Monitor-Secret', MONITOR_SECRET);

    expect(res.statusCode).toBe(202);
    expect(res.body.success).toBe(true);
    expect(res.body.data.started).toBe(true);
    expect(res.body.data.status).toBe('running');
    expect(res.body.data.runId).toBeDefined();

    // Wait for background worker to complete
    await new Promise((r) => setTimeout(r, 600));

    // Verify metrics on run-specific status endpoint
    const statusRes = await request(app)
      .get(`/api/monitor/runs/${res.body.data.runId}`)
      .set('X-Monitor-Secret', MONITOR_SECRET);

    expect(statusRes.statusCode).toBe(200);
    expect(typeof statusRes.body.data.offersAttempted).toBe('number');
    expect(typeof statusRes.body.data.triggeredAlerts).toBe('number');
  });

  // 17: User on-demand refresh triggers successfully from UI
  it('Condition 17: User trigger endpoint POST /api/monitor/trigger executes on-demand with JWT auth', async () => {
    if (!hasDb) return;

    const res = await request(app)
      .post('/api/monitor/trigger')
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.offersChecked).toBe('number');
    expect(typeof res.body.data.triggeredAlerts).toBe('number');
  });

  // 18: Notification Failure Retains Armed State for Safe Retry
  it('Condition 18: Transient notification delivery failure does not disarm alert, enabling retry on subsequent cycle', async () => {
    if (!hasDb) return;

    // Simulate transient notification outage on Brevo
    sendEmailSpy.mockResolvedValueOnce({
      success: false,
      errorMessage: 'Brevo API temporary 503 outage',
    });

    const fetchSpy = jest.spyOn(providerDispatcher, 'fetchOffer').mockImplementation(async (offer) => {
      if (offer._id?.toString() === testOffer._id.toString()) {
        return {
          provider: 'apify',
          externalProductId: testOffer.externalProductId,
          success: true,
          priceInPaise: 2000000, // Meets target
          availability: 'in_stock',
          fetchedAt: new Date().toISOString(),
        };
      }
      return { success: false, errorMessage: 'skipped in test' };
    });

    const retryAlert = await Alert.create({
      userId: testUser._id,
      offerId: testOffer._id,
      type: 'target_price',
      targetPriceInPaise: 2500000,
      channels: ['email'],
      status: 'active',
      armed: true,
    });

    // Run cycle: Condition is met, but notification fails
    const cycle1 = await runMonitoringCycle({ force: true });
    // triggeredAlerts is 0 because no notification successfully delivered
    expect(cycle1.triggeredAlerts).toBe(0);

    // Alert MUST remain armed!
    const alertAfterFailure = await Alert.findById(retryAlert._id);
    expect(alertAfterFailure.armed).toBe(true);

    // Failed audit log recorded in NotificationEvent
    const failedEvent = await NotificationEvent.findOne({ alertId: retryAlert._id, status: 'failed' });
    expect(failedEvent).not.toBeNull();
    expect(failedEvent.errorMessage).toContain('Brevo API temporary 503 outage');

    // Second cycle: Notification service is restored!
    sendEmailSpy.mockResolvedValueOnce({
      success: true,
      providerMessageId: 'brevo-restored-id-123',
    });

    const cycle2 = await runMonitoringCycle({ force: true });
    expect(cycle2.triggeredAlerts).toBe(1);

    // Alert is now successfully disarmed!
    const alertAfterSuccess = await Alert.findById(retryAlert._id);
    expect(alertAfterSuccess.armed).toBe(false);

    await Alert.findByIdAndDelete(retryAlert._id);
    await NotificationEvent.deleteMany({ alertId: retryAlert._id });
    fetchSpy.mockRestore();
  }, 25000);

  // 18B: Multi-channel partial delivery: email succeeds while telegram fails -> retry next cycle without re-sending email
  it('Condition 18B: Multi-channel partial delivery retries failed channel only and disarms when all channels complete', async () => {
    if (!hasDb) return;

    const fetchSpy = jest.spyOn(providerDispatcher, 'fetchOffer').mockImplementation(async (offer) => {
      if (offer._id?.toString() === testOffer._id.toString()) {
        return {
          provider: 'apify',
          externalProductId: testOffer.externalProductId,
          success: true,
          priceInPaise: 2000000, // Meets target
          availability: 'in_stock',
          fetchedAt: new Date().toISOString(),
        };
      }
      return { success: false, errorMessage: 'skipped in test' };
    });

    const multiAlert = await Alert.create({
      userId: testUser._id,
      offerId: testOffer._id,
      type: 'target_price',
      targetPriceInPaise: 2500000,
      channels: ['email', 'telegram'],
      status: 'active',
      armed: true,
    });

    // Cycle 1: Email succeeds, Telegram fails
    sendEmailSpy.mockResolvedValueOnce({
      success: true,
      providerMessageId: 'brevo-multi-123',
    });
    sendTelegramSpy.mockResolvedValueOnce({
      success: false,
      errorMessage: 'Telegram API 500 error',
    });

    const cycle1 = await runMonitoringCycle({ force: true });
    // Alert NOT disarmed because Telegram failed
    expect(cycle1.triggeredAlerts).toBe(0);

    const alertAfterCycle1 = await Alert.findById(multiAlert._id);
    expect(alertAfterCycle1.armed).toBe(true);

    // Verify email event is sent, telegram event is failed
    const emailEvent1 = await NotificationEvent.findOne({ alertId: multiAlert._id, channel: 'email', status: 'sent' });
    expect(emailEvent1).not.toBeNull();
    const tgEvent1 = await NotificationEvent.findOne({ alertId: multiAlert._id, channel: 'telegram', status: 'failed' });
    expect(tgEvent1).not.toBeNull();

    // Cycle 2: Telegram is restored!
    sendEmailSpy.mockClear();
    sendTelegramSpy.mockClear();
    sendTelegramSpy.mockResolvedValueOnce({
      success: true,
      messageId: 'telegram-restored-456',
    });

    const cycle2 = await runMonitoringCycle({ force: true });
    // Alert is now complete and disarmed!
    expect(cycle2.triggeredAlerts).toBe(1);

    // CRITICAL: Email must NOT have been sent again!
    expect(sendEmailSpy).not.toHaveBeenCalled();
    // Telegram WAS called and delivered!
    expect(sendTelegramSpy).toHaveBeenCalledTimes(1);

    const alertAfterCycle2 = await Alert.findById(multiAlert._id);
    expect(alertAfterCycle2.armed).toBe(false);

    // Telegram now has a successful canonical record
    const tgEvent2 = await NotificationEvent.findOne({ alertId: multiAlert._id, channel: 'telegram', status: 'sent' });
    expect(tgEvent2).not.toBeNull();

    // Cycle 3: Repeated cycle must not duplicate any notification
    sendEmailSpy.mockClear();
    sendTelegramSpy.mockClear();

    const cycle3 = await runMonitoringCycle({ force: true });
    expect(cycle3.triggeredAlerts).toBe(0);
    expect(sendEmailSpy).not.toHaveBeenCalled();
    expect(sendTelegramSpy).not.toHaveBeenCalled();

    await Alert.findByIdAndDelete(multiAlert._id);
    await NotificationEvent.deleteMany({ alertId: multiAlert._id });
    fetchSpy.mockRestore();
  }, 25000);

  // 18C: All requested channels fail -> alert remains armed
  it('Condition 18C: When all requested channels fail, alert remains armed for retry', async () => {
    if (!hasDb) return;

    const fetchSpy = jest.spyOn(providerDispatcher, 'fetchOffer').mockImplementation(async (offer) => {
      if (offer._id?.toString() === testOffer._id.toString()) {
        return {
          provider: 'apify',
          externalProductId: testOffer.externalProductId,
          success: true,
          priceInPaise: 2000000,
          availability: 'in_stock',
          fetchedAt: new Date().toISOString(),
        };
      }
      return { success: false, errorMessage: 'skipped in test' };
    });

    const allFailAlert = await Alert.create({
      userId: testUser._id,
      offerId: testOffer._id,
      type: 'target_price',
      targetPriceInPaise: 2500000,
      channels: ['email', 'telegram'],
      status: 'active',
      armed: true,
    });

    sendEmailSpy.mockResolvedValueOnce({ success: false, errorMessage: 'Brevo down' });
    sendTelegramSpy.mockResolvedValueOnce({ success: false, errorMessage: 'Telegram down' });

    const cycle = await runMonitoringCycle({ force: true });
    expect(cycle.triggeredAlerts).toBe(0);

    const alertAfter = await Alert.findById(allFailAlert._id);
    expect(alertAfter.armed).toBe(true);

    await Alert.findByIdAndDelete(allFailAlert._id);
    await NotificationEvent.deleteMany({ alertId: allFailAlert._id });
    fetchSpy.mockRestore();
  }, 25000);

  // 18D: evaluateNotificationCompletion helper unit matrix
  it('Condition 18D: evaluateNotificationCompletion accurately assesses completion matrix', () => {
    const alertMulti = { channels: ['email', 'telegram'] };

    // Case 1: Both succeed
    const resBoth = [
      { channel: 'email', success: true, delivered: true, status: 'sent' },
      { channel: 'telegram', success: true, delivered: true, status: 'sent' },
    ];
    expect(evaluateNotificationCompletion(alertMulti, resBoth).allComplete).toBe(true);

    // Case 2: Email succeeds, Telegram fails
    const resPartial = [
      { channel: 'email', success: true, delivered: true, status: 'sent' },
      { channel: 'telegram', success: false, delivered: false, status: 'failed' },
    ];
    const evalPartial = evaluateNotificationCompletion(alertMulti, resPartial);
    expect(evalPartial.allComplete).toBe(false);
    expect(evalPartial.pendingChannels).toEqual(['telegram']);

    // Case 3: Email already sent, Telegram newly sent
    const resRetry = [
      { channel: 'email', success: true, delivered: true, status: 'already_sent' },
      { channel: 'telegram', success: true, delivered: true, status: 'sent' },
    ];
    expect(evaluateNotificationCompletion(alertMulti, resRetry).allComplete).toBe(true);

    // Case 4: Corrupted or empty channels array defaults gracefully to email without endless loop
    const alertEmpty = { channels: [] };
    const resDefault = [{ channel: 'email', success: true, delivered: true, status: 'sent' }];
    expect(evaluateNotificationCompletion(alertEmpty, resDefault).allComplete).toBe(true);
  });

  // 19: Apify listing identity verification matches tracked ID and rejects mismatched listings
  it('Condition 19: Apify refresh verifies listing ID and rejects unrelated product results', async () => {
    process.env.APIFY_API_TOKEN = 'mock-apify-test-token';

    // Case A: Apify Actor returns an item that does not match the cleanId or productUrl
    const axiosSpyA = jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: [
        {
          asin: 'B00000MISMATCH',
          title: 'Unrelated Generic Cables',
          price: 199,
          url: 'https://www.amazon.in/dp/B00000MISMATCH',
        },
      ],
    });

    const targetOffer = {
      provider: 'apify',
      externalProductId: 'amazon-B09XS7JWHH',
      productUrl: 'https://www.amazon.in/dp/B09XS7JWHH',
    };

    const mismatchRes = await apifyModule.fetchOffer(targetOffer);
    expect(mismatchRes.success).toBe(false);
    expect(mismatchRes.errorMessage).toContain('Listing mismatch');
    axiosSpyA.mockRestore();

    // Case B: Apify Actor returns the correct matching item
    const axiosSpyB = jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: [
        {
          asin: 'B09XS7JWHH',
          title: 'Sony WH-1000XM5 Wireless Headphones',
          price: 26990,
          url: 'https://www.amazon.in/dp/B09XS7JWHH',
        },
      ],
    });

    const matchRes = await apifyModule.fetchOffer(targetOffer);
    expect(matchRes.success).toBe(true);
    expect(matchRes.priceInPaise).toBe(2699000);
    expect(matchRes.title).toContain('Sony WH-1000XM5');
    axiosSpyB.mockRestore();
  });

  // 20: Cross-currency rejection and same-currency acceptance
  it('Condition 20: Evaluator rejects cross-currency comparisons and accepts matching currency', () => {
    const inrAlert = {
      _id: new mongoose.Types.ObjectId(),
      type: 'target_price',
      currency: 'INR',
      targetPriceInPaise: 100000, // ₹1,000
      status: 'active',
      armed: true,
    };

    // Cross-currency: Listing price is in USD ($10 = 1000 cents) against an INR alert
    const crossRes = evaluateAlert(inrAlert, 1000, null, {
      currency: 'USD',
      targetCurrency: inrAlert.currency,
    });
    expect(crossRes.conditionMet).toBe(false);
    expect(crossRes.reason).toContain('Currency mismatch');

    // Same-currency: Listing price is in INR (₹950 = 95,000 paise) against an INR alert
    const sameRes = evaluateAlert(inrAlert, 95000, null, {
      currency: 'INR',
      targetCurrency: inrAlert.currency,
    });
    expect(sameRes.conditionMet).toBe(true);
    expect(sameRes.shouldNotify).toBe(true);
  });
});
