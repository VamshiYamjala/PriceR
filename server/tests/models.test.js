import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Offer from '../src/models/Offer.js';
import PriceObservation from '../src/models/PriceObservation.js';
import WatchlistItem from '../src/models/WatchlistItem.js';
import Alert from '../src/models/Alert.js';
import NotificationEvent from '../src/models/NotificationEvent.js';

const hasDb = Boolean(process.env.MONGODB_URI);

describe('Mongoose Models Schema Validation & Constraints (Document 1 Section 5)', () => {
  beforeAll(async () => {
    if (!hasDb) return;
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
  });

  afterAll(async () => {
    if (!hasDb) return;
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe('User Model', () => {
    it('should exclude passwordHash by default from queries', async () => {
      const email = `model_user_${Date.now()}@example.com`;
      const created = await User.create({
        name: 'Model User',
        email,
        passwordHash: 'secret_hash_value',
      });

      const fetched = await User.findById(created._id);
      expect(fetched.passwordHash).toBeUndefined();

      await User.findByIdAndDelete(created._id);
    });
  });

  describe('Offer Model', () => {
    it('should reject non-integer float priceInPaise via validation', async () => {
      const dummyOffer = new Offer({
        productId: new mongoose.Types.ObjectId(),
        provider: 'flipkart',
        externalProductId: 'TEST-EXT-1',
        title: 'Test Offer',
        productUrl: 'https://example.com',
        priceInPaise: 1499.50, // Float — should fail integer validator
        availability: 'in_stock',
      });

      let err;
      try {
        await dummyOffer.validate();
      } catch (e) {
        err = e;
      }

      expect(err).toBeDefined();
      expect(err.errors['priceInPaise']).toBeDefined();
    });
  });

  describe('PriceObservation Model', () => {
    it('should allow saving failed observation without priceInPaise', async () => {
      const observation = new PriceObservation({
        offerId: new mongoose.Types.ObjectId(),
        status: 'failure',
        errorMessage: 'Connection timeout',
        fetchedAt: new Date(),
      });

      const validationError = observation.validateSync();
      expect(validationError).toBeUndefined();
    });

    it('should require priceInPaise when status is success', async () => {
      const observation = new PriceObservation({
        offerId: new mongoose.Types.ObjectId(),
        status: 'success',
        fetchedAt: new Date(),
      });

      const err = observation.validateSync();
      expect(err).toBeDefined();
      expect(err.errors['priceInPaise']).toBeDefined();
    });
  });

  describe('Alert Model', () => {
    it('should require targetPriceInPaise for target_price alerts', () => {
      const alert = new Alert({
        userId: new mongoose.Types.ObjectId(),
        offerId: new mongoose.Types.ObjectId(),
        type: 'target_price',
        channels: ['email'],
      });

      const err = alert.validateSync();
      expect(err).toBeDefined();
      expect(err.errors['targetPriceInPaise']).toBeDefined();
    });

    it('should require dropAmountInPaise for fixed_drop alerts', () => {
      const alert = new Alert({
        userId: new mongoose.Types.ObjectId(),
        offerId: new mongoose.Types.ObjectId(),
        type: 'fixed_drop',
        channels: ['email'],
      });

      const err = alert.validateSync();
      expect(err).toBeDefined();
      expect(err.errors['dropAmountInPaise']).toBeDefined();
    });

    it('should reject empty channels array', () => {
      const alert = new Alert({
        userId: new mongoose.Types.ObjectId(),
        offerId: new mongoose.Types.ObjectId(),
        type: 'target_price',
        targetPriceInPaise: 100000,
        channels: [],
      });

      const err = alert.validateSync();
      expect(err).toBeDefined();
      expect(err.errors['channels']).toBeDefined();
    });
  });
});
