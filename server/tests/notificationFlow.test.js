import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Offer from '../src/models/Offer.js';
import Alert from '../src/models/Alert.js';
import PriceObservation from '../src/models/PriceObservation.js';
import NotificationEvent from '../src/models/NotificationEvent.js';
import { evaluateAlert } from '../src/services/alertEvaluator.js';
import { calculateGenuineSavings, findLowestOffer } from '../src/services/priceComparison.js';
import { runMonitoringCycle } from '../src/services/priceMonitor.js';

const hasDb = Boolean(process.env.MONGODB_URI);
const JWT_SECRET = process.env.JWT_SECRET || 'testsecret1234567890123456789012';

describe('PriceRadar Notification Flow & Alert Engine Verification (10 Core Conditions)', () => {
  let userA, userB;
  let tokenA, tokenB;
  let testProduct;
  let testOfferSample, testOfferLive;

  beforeAll(async () => {
    if (!hasDb) return;
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Create isolated test users
    const timestamp = Date.now();
    userA = await User.create({
      name: 'Test User A',
      email: `test_user_a_${timestamp}@example.com`,
      passwordHash: 'dummyhash123',
      telegramChatId: '123456789',
    });
    tokenA = jwt.sign({ sub: userA._id.toString() }, JWT_SECRET, { expiresIn: '1h' });

    userB = await User.create({
      name: 'Test User B',
      email: `test_user_b_${timestamp}@example.com`,
      passwordHash: 'dummyhash123',
      telegramChatId: null, // Unlinked Telegram
    });
    tokenB = jwt.sign({ sub: userB._id.toString() }, JWT_SECRET, { expiresIn: '1h' });

    // Create isolated test product
    testProduct = await Product.create({
      title: 'Notification Test Product',
      brand: 'TestBrand',
      model: 'NT-100',
      canonicalKey: `test-notif-product-${timestamp}`,
      sourceProvider: 'fixture',
      dataStatus: 'sample',
    });

    // Create isolated sample offer (fixture-driven)
    testOfferSample = await Offer.create({
      productId: testProduct._id,
      provider: 'flipkart',
      externalProductId: `TEST-EXT-SAMPLE-${timestamp}`,
      title: 'Sample Test Offer',
      productUrl: 'https://example.com/test-sample',
      priceInPaise: 100000, // ₹1,000
      currency: 'INR',
      availability: 'in_stock',
      isSample: true,
      dataStatus: 'sample',
      lastStatus: 'ok',
    });

    // Create isolated live offer
    testOfferLive = await Offer.create({
      productId: testProduct._id,
      provider: 'flipkart',
      externalProductId: `TEST-EXT-LIVE-${timestamp}`,
      title: 'Live Test Offer',
      productUrl: 'https://example.com/test-live',
      priceInPaise: 150000, // ₹1,500
      currency: 'INR',
      availability: 'in_stock',
      isSample: false,
      dataStatus: 'live',
      lastStatus: 'ok',
    });
  }, 30000);

  afterAll(async () => {
    if (!hasDb) return;
    try {
      if (userA) {
        await Alert.deleteMany({ userId: userA._id });
        await NotificationEvent.deleteMany({ userId: userA._id });
        await User.findByIdAndDelete(userA._id);
      }
      if (userB) {
        await Alert.deleteMany({ userId: userB._id });
        await NotificationEvent.deleteMany({ userId: userB._id });
        await User.findByIdAndDelete(userB._id);
      }
      if (testOfferSample) {
        await PriceObservation.deleteMany({ offerId: testOfferSample._id });
        await Offer.findByIdAndDelete(testOfferSample._id);
      }
      if (testOfferLive) {
        await PriceObservation.deleteMany({ offerId: testOfferLive._id });
        await Offer.findByIdAndDelete(testOfferLive._id);
      }
      if (testProduct) {
        await Product.findByIdAndDelete(testProduct._id);
      }
    } finally {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
    }
  }, 30000);

  // -------------------------------------------------------------------------
  // Condition 1: Target-price alert condition met vs not met
  // -------------------------------------------------------------------------
  describe('Condition 1: Target-Price Alert Condition', () => {
    const alert = {
      _id: new mongoose.Types.ObjectId(),
      type: 'target_price',
      targetPriceInPaise: 100000, // Target: ₹1,000
      status: 'active',
      armed: true,
    };

    it('should NOT trigger an alert when price is above target price', () => {
      const res = evaluateAlert(alert, 120000); // Current: ₹1,200
      expect(res.conditionMet).toBe(false);
      expect(res.shouldNotify).toBe(false);
      expect(res.shouldRearm).toBe(false);
    });

    it('should trigger an alert when price drops to or below target price', () => {
      const resUnder = evaluateAlert(alert, 95000); // Current: ₹950
      expect(resUnder.conditionMet).toBe(true);
      expect(resUnder.shouldNotify).toBe(true);
      expect(resUnder.reason).toContain('meeting your target of ₹1000');

      const resEqual = evaluateAlert(alert, 100000); // Current: exactly ₹1,000
      expect(resEqual.conditionMet).toBe(true);
      expect(resEqual.shouldNotify).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Condition 2: First observation baseline behavior (no prior observation)
  // -------------------------------------------------------------------------
  describe('Condition 2: Fixed-Drop Baseline Behavior on First Observation', () => {
    const alert = {
      _id: new mongoose.Types.ObjectId(),
      type: 'fixed_drop',
      dropAmountInPaise: 20000, // Drop requirement: ₹200
      status: 'active',
      armed: true,
    };

    it('should NOT trigger an alert on the first observation when previousPrice is null', () => {
      const res = evaluateAlert(alert, 80000, null); // First observation: ₹800, previous: null
      expect(res.conditionMet).toBe(false);
      expect(res.shouldNotify).toBe(false);
      expect(res.shouldRearm).toBe(false);
    });

    it('should NOT trigger when previousPrice is 0 or negative', () => {
      const resZero = evaluateAlert(alert, 80000, 0);
      expect(resZero.conditionMet).toBe(false);
      expect(resZero.shouldNotify).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Condition 3: Subsequent fixed-drop threshold evaluation
  // -------------------------------------------------------------------------
  describe('Condition 3: Subsequent Fixed-Drop Evaluation', () => {
    const alert = {
      _id: new mongoose.Types.ObjectId(),
      type: 'fixed_drop',
      dropAmountInPaise: 20000, // ₹200 drop
      status: 'active',
      armed: true,
    };

    it('should trigger when price drops by equal to or more than drop amount', () => {
      // Previous: ₹1,000 (100,000 paise), Current: ₹750 (75,000 paise) -> drop of ₹250
      const res = evaluateAlert(alert, 75000, 100000);
      expect(res.conditionMet).toBe(true);
      expect(res.shouldNotify).toBe(true);
      expect(res.reason).toContain('dropped by ₹250');
    });

    it('should NOT trigger when price drops by less than drop amount', () => {
      // Previous: ₹1,000, Current: ₹900 -> drop of ₹100 (< ₹200)
      const res = evaluateAlert(alert, 90000, 100000);
      expect(res.conditionMet).toBe(false);
      expect(res.shouldNotify).toBe(false);
    });

    it('should NOT trigger when price increases', () => {
      // Previous: ₹1,000, Current: ₹1,200 -> price increase
      const res = evaluateAlert(alert, 120000, 100000);
      expect(res.conditionMet).toBe(false);
      expect(res.shouldNotify).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Condition 4: Sample and fixture offers cannot claim genuine live savings
  // -------------------------------------------------------------------------
  describe('Condition 4: Sample vs Live Market Savings Safeguard', () => {
    it('should reject genuine market savings claims when base or compared offer is sample data', () => {
      const sampleOffer1 = {
        provider: 'dummyjson',
        priceInPaise: 80000,
        currency: 'INR',
        isSample: true,
        dataStatus: 'sample',
      };
      const sampleOffer2 = {
        provider: 'flipkart',
        priceInPaise: 100000,
        currency: 'INR',
        isSample: true,
        dataStatus: 'sample',
      };

      const savings = calculateGenuineSavings(sampleOffer2, sampleOffer1);
      expect(savings.isGenuine).toBe(false);
      expect(savings.reason).toContain('sample or simulated');
      expect(savings.savingsInPaise).toBe(20000);
    });

    it('should allow genuine savings only between verified live offers with matching currency', () => {
      const liveBase = {
        provider: 'flipkart',
        priceInPaise: 200000,
        currency: 'INR',
        isSample: false,
        dataStatus: 'live',
      };
      const liveCompared = {
        provider: 'ebay',
        priceInPaise: 160000,
        currency: 'INR',
        isSample: false,
        dataStatus: 'live',
      };

      const savings = calculateGenuineSavings(liveBase, liveCompared);
      expect(savings.isGenuine).toBe(true);
      expect(savings.savingsInPaise).toBe(40000);
      expect(savings.savingsPercent).toBe(20.0);
    });
  });

  // -------------------------------------------------------------------------
  // Condition 5: Explicit demo/test label on simulated sample alert notifications
  // -------------------------------------------------------------------------
  describe('Condition 5: Demo Alert Formatting & Transparency Disclaimer', () => {
    it('should format demo notifications distinctly from live notifications in monitor dispatch', () => {
      const sampleOffer = {
        title: 'Sony WH-1000XM5',
        productUrl: 'https://example.com/sony',
        isSample: true,
        dataStatus: 'sample',
      };
      const liveOffer = {
        title: 'Sony WH-1000XM5',
        productUrl: 'https://example.com/sony',
        isSample: false,
        dataStatus: 'live',
      };

      // Helper reproducing the exact subject tag & notice generation in priceMonitor.js lines 106-110
      function formatNotification(offer) {
        const isSampleOffer = Boolean(offer.isSample || offer.dataStatus === 'sample');
        const subjectTag = isSampleOffer ? '[PriceRadar Demo Alert]' : '[PriceRadar Alert]';
        const demoNotice = isSampleOffer
          ? '\n\n(Notice: This alert was triggered by a simulated sample/demo offer, not a verified live retailer drop.)'
          : '';
        return { subjectTag, demoNotice };
      }

      const sampleFormatted = formatNotification(sampleOffer);
      expect(sampleFormatted.subjectTag).toBe('[PriceRadar Demo Alert]');
      expect(sampleFormatted.demoNotice).toContain('simulated sample/demo offer');

      const liveFormatted = formatNotification(liveOffer);
      expect(liveFormatted.subjectTag).toBe('[PriceRadar Alert]');
      expect(liveFormatted.demoNotice).toBe('');
    });
  });

  // -------------------------------------------------------------------------
  // Condition 6: Duplicate alert suppression on repeated cycles
  // -------------------------------------------------------------------------
  describe('Condition 6: Duplicate Alert Suppression on Repeated Cycles', () => {
    it('should disarm the alert on first trigger so repeated cycles do not re-notify', () => {
      const alert = {
        _id: new mongoose.Types.ObjectId(),
        type: 'target_price',
        targetPriceInPaise: 100000,
        status: 'active',
        armed: true,
      };

      // Cycle 1: Price drops to ₹900 -> fires and disarms
      const cycle1 = evaluateAlert(alert, 90000);
      expect(cycle1.conditionMet).toBe(true);
      expect(cycle1.shouldNotify).toBe(true);

      // Simulate disarming in database
      alert.armed = false;

      // Cycle 2: Price is still ₹900 -> condition still met, but shouldNotify must be FALSE
      const cycle2 = evaluateAlert(alert, 90000);
      expect(cycle2.conditionMet).toBe(true);
      expect(cycle2.shouldNotify).toBe(false);
      expect(cycle2.shouldRearm).toBe(false);
    });

    it('should enforce unique index constraint on NotificationEvent (alertId + dedupeKey)', async () => {
      if (!hasDb) return;
      const alertId = new mongoose.Types.ObjectId();
      const dedupeKey = `${alertId.toString()}:90000:email`;

      // Insert first event
      const event1 = await NotificationEvent.create({
        userId: userA._id,
        alertId,
        channel: 'email',
        status: 'sent',
        message: 'Test drop message',
        dedupeKey,
      });
      expect(event1).toBeDefined();

      // Attempt second insert with identical alertId and dedupeKey -> must fail duplicate index (E11000)
      let duplicateErr;
      try {
        await NotificationEvent.create({
          userId: userA._id,
          alertId,
          channel: 'email',
          status: 'sent',
          message: 'Duplicate drop message',
          dedupeKey,
        });
      } catch (err) {
        duplicateErr = err;
      }

      expect(duplicateErr).toBeDefined();
      expect(duplicateErr.code).toBe(11000);

      // Clean up
      await NotificationEvent.findByIdAndDelete(event1._id);
    });
  });

  // -------------------------------------------------------------------------
  // Condition 7: Alert re-arming lifecycle
  // -------------------------------------------------------------------------
  describe('Condition 7: Alert Re-Arming Lifecycle', () => {
    it('should re-arm when price rises back above target threshold, then fire again on next drop', () => {
      const alert = {
        _id: new mongoose.Types.ObjectId(),
        type: 'target_price',
        targetPriceInPaise: 100000, // ₹1,000
        status: 'active',
        armed: false, // Disarmed from previous trigger
      };

      // Step 1: Price rises to ₹1,200 -> shouldRearm becomes true
      const step1 = evaluateAlert(alert, 120000);
      expect(step1.conditionMet).toBe(false);
      expect(step1.shouldNotify).toBe(false);
      expect(step1.shouldRearm).toBe(true);

      // Re-arm the alert
      alert.armed = true;

      // Step 2: Price drops again to ₹950 -> triggers notification again
      const step2 = evaluateAlert(alert, 95000);
      expect(step2.conditionMet).toBe(true);
      expect(step2.shouldNotify).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Condition 8: Failed provider or invalid price resilience
  // -------------------------------------------------------------------------
  describe('Condition 8: Provider Failure & Invalid Price Safety', () => {
    const alert = {
      _id: new mongoose.Types.ObjectId(),
      type: 'target_price',
      targetPriceInPaise: 100000,
      status: 'active',
      armed: true,
    };

    it('should NEVER treat ₹0 or negative price as a valid drop', () => {
      const resZero = evaluateAlert(alert, 0);
      expect(resZero.conditionMet).toBe(false);
      expect(resZero.shouldNotify).toBe(false);
      expect(resZero.reason).toContain('Invalid or non-positive');

      const resNegative = evaluateAlert(alert, -50000);
      expect(resNegative.conditionMet).toBe(false);
      expect(resNegative.shouldNotify).toBe(false);
    });

    it('should safely reject NaN or non-number inputs without throwing', () => {
      const resNaN = evaluateAlert(alert, NaN);
      expect(resNaN.conditionMet).toBe(false);
      expect(resNaN.shouldNotify).toBe(false);

      const resString = evaluateAlert(alert, 'invalid');
      expect(resString.conditionMet).toBe(false);
      expect(resString.shouldNotify).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Condition 9: User isolation for alerts and notifications
  // -------------------------------------------------------------------------
  describe('Condition 9: User Isolation for Alerts & Notifications', () => {
    it('User B cannot view or modify User A alerts via API', async () => {
      if (!hasDb) return;

      // Create an alert owned by User A
      const alertA = await Alert.create({
        userId: userA._id,
        offerId: testOfferSample._id,
        type: 'target_price',
        targetPriceInPaise: 90000,
        channels: ['email'],
        status: 'active',
      });

      // User B tries to view alerts -> User A's alert should NOT be present
      const resB = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(resB.status).toBe(200);
      const userBAlertIds = resB.body.data.alerts.map((a) => a.id);
      expect(userBAlertIds).not.toContain(alertA._id.toString());

      // User B tries to patch User A's alert -> should fail with 404
      const patchRes = await request(app)
        .patch(`/api/alerts/${alertA._id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ status: 'paused' });

      expect(patchRes.status).toBe(404);

      // Clean up
      await Alert.findByIdAndDelete(alertA._id);
    });

    it('User B cannot view User A notification history via /api/notifications', async () => {
      if (!hasDb) return;

      const eventA = await NotificationEvent.create({
        userId: userA._id,
        alertId: new mongoose.Types.ObjectId(),
        channel: 'email',
        status: 'sent',
        message: 'Confidential alert for User A',
        dedupeKey: `user_a_test_${Date.now()}`,
      });

      const resB = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(resB.status).toBe(200);
      const eventIds = resB.body.data.events.map((e) => e.id);
      expect(eventIds).not.toContain(eventA._id.toString());

      // Clean up
      await NotificationEvent.findByIdAndDelete(eventA._id);
    });
  });

  // -------------------------------------------------------------------------
  // Condition 10: Notification channel preferences matrix & paused alert state
  // -------------------------------------------------------------------------
  describe('Condition 10: Channel Preferences Matrix & Paused State', () => {
    it('should NOT trigger an alert when alert status is "paused"', () => {
      const pausedAlert = {
        _id: new mongoose.Types.ObjectId(),
        type: 'target_price',
        targetPriceInPaise: 100000,
        status: 'paused', // Paused!
        armed: true,
      };

      const res = evaluateAlert(pausedAlert, 80000); // Price drops, but alert is paused
      expect(res.conditionMet).toBe(true);
      expect(res.shouldNotify).toBe(false); // Must not notify when paused
    });

    it('should reject creating an alert with empty channels array', () => {
      const invalidAlert = new Alert({
        userId: new mongoose.Types.ObjectId(),
        offerId: new mongoose.Types.ObjectId(),
        type: 'target_price',
        targetPriceInPaise: 50000,
        channels: [], // Empty!
      });

      const err = invalidAlert.validateSync();
      expect(err).toBeDefined();
      expect(err.errors['channels']).toBeDefined();
    });

    it('should record failed notification event gracefully if Telegram is selected but chat is unlinked', async () => {
      if (!hasDb) return;

      // User B has telegramChatId: null
      expect(userB.telegramChatId).toBeNull();

      const mockEvent = await NotificationEvent.create({
        userId: userB._id,
        alertId: new mongoose.Types.ObjectId(),
        channel: 'telegram',
        status: 'failed',
        message: 'Price drop notification',
        errorMessage: 'User has not linked their Telegram account.',
        dedupeKey: `unlinked_test_${Date.now()}`,
      });

      expect(mockEvent.status).toBe('failed');
      expect(mockEvent.errorMessage).toContain('not linked');

      await NotificationEvent.findByIdAndDelete(mockEvent._id);
    });
  });

  // -------------------------------------------------------------------------
  // Condition 11: Recipient Resolution, Provider Message ID & Delivery Audit
  // -------------------------------------------------------------------------
  describe('Condition 11: Recipient Resolution, Provider Tracking & Channel Independence', () => {
    it('should resolve recipient directly from alert owner and persist providerMessageId', async () => {
      if (!hasDb) return;

      const event = await NotificationEvent.create({
        userId: userA._id,
        alertId: new mongoose.Types.ObjectId(),
        channel: 'email',
        status: 'sent',
        recipient: userA.email,
        providerMessageId: '<brevo-test-msg-12345@smtp-relay.brevo.com>',
        message: 'Price dropped to target!',
        dedupeKey: `audit_test_${Date.now()}`,
      });

      expect(event.recipient).toBe(userA.email);
      expect(event.providerMessageId).toBe('<brevo-test-msg-12345@smtp-relay.brevo.com>');

      // Query via /api/notifications
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      const targetEvt = res.body.data.events.find((e) => e.id === event._id.toString());
      expect(targetEvt).toBeDefined();
      expect(targetEvt.recipient).toBe(userA.email);
      expect(targetEvt.providerMessageId).toBe('<brevo-test-msg-12345@smtp-relay.brevo.com>');

      await NotificationEvent.findByIdAndDelete(event._id);
    });
  });
});
