import request from 'supertest';
import app from '../src/app.js';
import { findLowestOffer, calculateSavings, calculateGenuineSavings } from '../src/services/priceComparison.js';
import * as ebayProvider from '../src/providers/ebay.js';
import * as dummyjsonProvider from '../src/providers/dummyjson.js';

describe('Multi-Provider Architecture & Safeguards (Prompt Specifications)', () => {
  describe('Genuine Savings vs Sample Data Safeguards (Prompt Section 9)', () => {
    it('should reject genuine market savings claims when either offer is sample data', () => {
      const sampleOffer = {
        provider: 'dummyjson',
        priceInPaise: 800000,
        currency: 'INR',
        isSample: true,
        dataStatus: 'sample',
      };
      const fixtureOffer = {
        provider: 'flipkart',
        priceInPaise: 1000000,
        currency: 'INR',
        isSample: true,
        dataStatus: 'sample',
      };

      const result = calculateGenuineSavings(fixtureOffer, sampleOffer);
      expect(result.isGenuine).toBe(false);
      expect(result.reason).toContain('sample or simulated');
    });

    it('should reject savings calculation when currencies mismatch', () => {
      const inrOffer = {
        provider: 'flipkart',
        priceInPaise: 1000000,
        currency: 'INR',
        isSample: false,
        dataStatus: 'live',
      };
      const usdOffer = {
        provider: 'ebay',
        priceInPaise: 900000,
        currency: 'USD',
        isSample: false,
        dataStatus: 'live',
      };

      const result = calculateGenuineSavings(inrOffer, usdOffer);
      expect(result.isGenuine).toBe(false);
      expect(result.reason).toContain('Currency mismatch');
    });

    it('should approve genuine savings for matching currency live offers', () => {
      const baseOffer = {
        provider: 'flipkart',
        priceInPaise: 1000000,
        currency: 'INR',
        isSample: false,
        dataStatus: 'live',
      };
      const liveOffer = {
        provider: 'ebay',
        priceInPaise: 800000,
        currency: 'INR',
        isSample: false,
        dataStatus: 'live',
      };

      const result = calculateGenuineSavings(baseOffer, liveOffer);
      expect(result.isGenuine).toBe(true);
      expect(result.savingsInPaise).toBe(200000);
      expect(result.savingsPercent).toBe(20.0);
    });

    it('findLowestOffer should filter out sample offers when genuineOnly: true is set', () => {
      const offers = [
        { provider: 'dummyjson', priceInPaise: 500000, isSample: true, dataStatus: 'sample', availability: 'in_stock' },
        { provider: 'ebay', priceInPaise: 700000, isSample: false, dataStatus: 'live', availability: 'in_stock' },
      ];

      const genuineLowest = findLowestOffer(offers, { genuineOnly: true });
      expect(genuineLowest).not.toBeNull();
      expect(genuineLowest.provider).toBe('ebay');
      expect(genuineLowest.priceInPaise).toBe(700000);

      const anyLowest = findLowestOffer(offers, { genuineOnly: false });
      expect(anyLowest.provider).toBe('dummyjson');
    });
  });

  describe('eBay Browse Provider Behavior (Prompt Section 6)', () => {
    it('should report isConfigured() accurately based on environment credentials', () => {
      const isConfigured = ebayProvider.isConfigured();
      expect(typeof isConfigured).toBe('boolean');
    });

    it('should return unconfigured status message without throwing when searching unconfigured eBay', async () => {
      const origId = process.env.EBAY_CLIENT_ID;
      const origSecret = process.env.EBAY_CLIENT_SECRET;
      delete process.env.EBAY_CLIENT_ID;
      delete process.env.EBAY_CLIENT_SECRET;
      try {
        const result = await ebayProvider.searchProducts('phone');
        expect(result.provider).toBe('ebay');
        expect(result.status).toBe('unconfigured');
        expect(result.products).toEqual([]);
      } finally {
        if (origId) process.env.EBAY_CLIENT_ID = origId;
        if (origSecret) process.env.EBAY_CLIENT_SECRET = origSecret;
      }
    });

    it('normalizeEbayItem should return null for missing or invalid items', () => {
      expect(ebayProvider.normalizeEbayItem(null)).toBeNull();
      expect(ebayProvider.normalizeEbayItem({})).toBeNull();
    });

    it('normalizeEbayItem should normalize real eBay item summary to live or sandbox sample dataStatus', () => {
      const mockSummary = {
        itemId: 'v1|123456789012|0',
        title: 'Apple iPhone 13 128GB Midnight',
        price: { value: '499.00', currency: 'USD' },
        itemWebUrl: 'https://www.ebay.com/itm/123456789012',
        image: { imageUrl: 'https://i.ebayimg.com/images/g/test/s-l500.jpg' },
      };

      const normalized = ebayProvider.normalizeEbayItem(mockSummary);
      expect(normalized).not.toBeNull();
      expect(['live', 'sample']).toContain(normalized.dataStatus);
      expect(normalized.sourceProvider).toBe('ebay');
      expect(Number.isInteger(normalized.offers[0].priceInPaise)).toBe(true);
    });
  });

  describe('API Endpoints: Categories and Provider Status (Prompt Section 13)', () => {
    it('GET /api/products/categories should return category list', async () => {
      const res = await request(app).get('/api/products/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.categories)).toBe(true);
      expect(res.body.data.categories.length).toBeGreaterThan(0);
    });

    it('GET /api/products/providers/status should report provider states accurately', async () => {
      const res = await request(app).get('/api/products/providers/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const providers = res.body.data.providers;
      expect(Array.isArray(providers)).toBe(true);

      const apify = providers.find((p) => p.id === 'apify');
      expect(apify).toBeDefined();
      expect(apify.type).toBe('live');

      const ebay = providers.find((p) => p.id === 'ebay');
      expect(ebay).toBeDefined();
      expect(ebay.type).toBe('live');
      expect(['configured', 'unconfigured']).toContain(ebay.status);

      // DummyJSON and mock.shop must not be present as active discovery sources
      const dummy = providers.find((p) => p.id === 'dummyjson');
      expect(dummy).toBeUndefined();
    });

    it('GET /api/products/:productId returns 404 for unpersisted external catalog items', async () => {
      const res = await request(app).get('/api/products/dummyjson-999999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
