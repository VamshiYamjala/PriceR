import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Offer from '../src/models/Offer.js';
import WatchlistItem from '../src/models/WatchlistItem.js';
import Alert from '../src/models/Alert.js';
import { seedFixtures } from '../src/jobs/seedFixtures.js';

describe('Watchlist and Alerts API with User Isolation (Document 1 Sections 6.3 & 6.4)', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'testsecret1234567890123456789012';
  let userAId, userBId;
  let tokenA, tokenB;
  let testOfferId;

  const hasDb = Boolean(process.env.MONGODB_URI);

  beforeAll(async () => {
    if (!hasDb) return;
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Find any existing seeded offer, or seed if empty
    let offer = await Offer.findOne();
    if (!offer) {
      await seedFixtures({ mongoUri: process.env.MONGODB_URI });
      offer = await Offer.findOne();
    }
    if (!offer) {
      throw new Error('No offer available for watchlist test even after seeding');
    }
    testOfferId = offer._id.toString();

    // Create User A and User B
    const userA = await User.create({
      name: 'User A',
      email: `usera_${Date.now()}@example.com`,
      passwordHash: 'dummyhash',
    });
    userAId = userA._id.toString();
    tokenA = jwt.sign({ sub: userAId }, JWT_SECRET, { expiresIn: '1h' });

    const userB = await User.create({
      name: 'User B',
      email: `userb_${Date.now()}@example.com`,
      passwordHash: 'dummyhash',
    });
    userBId = userB._id.toString();
    tokenB = jwt.sign({ sub: userBId }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    if (!hasDb) return;
    if (userAId) {
      await WatchlistItem.deleteMany({ userId: userAId });
      await Alert.deleteMany({ userId: userAId });
      await User.findByIdAndDelete(userAId);
    }
    if (userBId) {
      await WatchlistItem.deleteMany({ userId: userBId });
      await Alert.deleteMany({ userId: userBId });
      await User.findByIdAndDelete(userBId);
    }
    await disconnectDB();
  });

  describe('Watchlist API & Isolation', () => {
    let watchlistItemAId;

    it('User A should add an offer to their watchlist', async () => {
      const res = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ offerId: testOfferId });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.item).toHaveProperty('id');
      watchlistItemAId = res.body.data.item.id;
    });

    it('User A adding duplicate offer should return 409 CONFLICT', async () => {
      const res = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ offerId: testOfferId });

      expect(res.statusCode).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('User A should see their watchlist item', async () => {
      const res = await request(app)
        .get('/api/watchlist')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].id).toBe(watchlistItemAId);
      expect(res.body.data.items[0].offer.id).toBe(testOfferId);
    });

    it('ISOLATION CHECK: User B should NOT see User A watchlist items', async () => {
      const res = await request(app)
        .get('/api/watchlist')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items).toEqual([]);
    });

    it('ISOLATION CHECK: User B cannot delete User A watchlist item (returns 404)', async () => {
      const res = await request(app)
        .delete(`/api/watchlist/${watchlistItemAId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('User A can delete their own watchlist item', async () => {
      const res = await request(app)
        .delete(`/api/watchlist/${watchlistItemAId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual({ deleted: true });
    });
  });

  describe('Alerts API & Isolation', () => {
    let alertAId;

    it('User A should create a target_price alert', async () => {
      const res = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          offerId: testOfferId,
          type: 'target_price',
          targetPriceInPaise: 1300000,
          channels: ['email'],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.alert.type).toBe('target_price');
      expect(res.body.data.alert.targetPriceInPaise).toBe(1300000);
      alertAId = res.body.data.alert.id;
    });

    it('User A should see their alert', async () => {
      const res = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.alerts.length).toBe(1);
      expect(res.body.data.alerts[0].id).toBe(alertAId);
    });

    it('ISOLATION CHECK: User B should NOT see User A alert', async () => {
      const res = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.alerts).toEqual([]);
    });

    it('User A should update alert status to paused', async () => {
      const res = await request(app)
        .patch(`/api/alerts/${alertAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ status: 'paused' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.alert.status).toBe('paused');
    });

    it('ISOLATION CHECK: User B cannot modify User A alert (returns 404)', async () => {
      const res = await request(app)
        .patch(`/api/alerts/${alertAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ status: 'active' });

      expect(res.statusCode).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('User A should delete their alert', async () => {
      const res = await request(app)
        .delete(`/api/alerts/${alertAId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual({ deleted: true });
    });

    it('Immediate Evaluation: target_price alert at or above current price triggers immediately and disarms', async () => {
      const offer = await Offer.findById(testOfferId);
      const res = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          offerId: testOfferId,
          type: 'target_price',
          targetPriceInPaise: (offer.priceInPaise || 100000) + 10000, // target >= current
          channels: ['email'],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.triggeredImmediately).toBe(true);
      expect(res.body.data.alert.armed).toBe(false);

      // Clean up
      await Alert.findByIdAndDelete(res.body.data.alert.id);
    });

    it('Fixed-Drop Baseline: fixed_drop alert does NOT trigger on creation and remains armed', async () => {
      const res = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          offerId: testOfferId,
          type: 'fixed_drop',
          dropAmountInPaise: 50000,
          channels: ['email'],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.triggeredImmediately).toBe(false);
      expect(res.body.data.alert.armed).toBe(true);

      // Clean up
      await Alert.findByIdAndDelete(res.body.data.alert.id);
    });
  });
});
