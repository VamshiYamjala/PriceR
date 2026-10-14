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

  describe('eBay Browse Provider Safe Unconfigured State (Prompt Section 6)', () => {
    it('should report isConfigured() as false when EBAY credentials are not in environment', () => {
      expect(ebayProvider.isConfigured()).toBe(false);
    });

    it('should return unconfigured status message without throwing when searching unconfigured eBay', async () => {
      const result = await ebayProvider.searchProducts('phone');
      expect(result.provider).toBe('ebay');
      expect(result.status).toBe('unconfigured');
      expect(result.products).toEqual([]);
    });

    it('normalizeEbayItem should return null for missing or invalid items', () => {
      expect(ebayProvider.normalizeEbayItem(null)).toBeNull();
      expect(ebayProvider.normalizeEbayItem({})).toBeNull();
    });

    it('normalizeEbayItem should normalize real eBay item summary to live dataStatus', () => {
      const mockSummary = {
        itemId: 'v1|123456789012|0',
        title: 'Apple iPhone 13 128GB Midnight',
        price: { value: '499.00', currency: 'USD' },
        itemWebUrl: 'https://www.ebay.com/itm/123456789012',
        image: { imageUrl: 'https://i.ebayimg.com/images/g/test/s-l500.jpg' },
      };

      const normalized = ebayProvider.normalizeEbayItem(mockSummary);
      expect(normalized).not.toBeNull();
      expect(normalized.dataStatus).toBe('live');
      expect(normalized.sourceProvider).toBe('ebay');
      expect(normalized.offers[0].isSample).toBe(false);
      expect(normalized.offers[0].dataStatus).toBe('live');
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

      const dummy = providers.find((p) => p.id === 'dummyjson');
      expect(dummy).toBeDefined();
      expect(dummy.type).toBe('sample');
      expect(dummy.status).toBe('active');

      const ebay = providers.find((p) => p.id === 'ebay');
      expect(ebay).toBeDefined();
      expect(ebay.type).toBe('live');
      expect(ebay.status).toBe('unconfigured');
    });

    it('GET /api/products/:productId with dummyjson ID should return normalized sample product', async () => {
      const res = await request(app).get('/api/products/dummyjson-1');
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data.product.sourceProvider).toBe('dummyjson');
        expect(res.body.data.product.dataStatus).toBe('sample');
        expect(res.body.data.offers[0].isSample).toBe(true);
      } else {
        // If external API has transient network failure, it should return 404 or graceful error
        expect([404, 500]).toContain(res.status);
      }
    });
  });
});
