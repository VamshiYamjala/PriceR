// server/tests/ebayProvider.test.js
import * as ebayProvider from '../src/providers/ebay.js';

describe('eBay Provider Adapter Suite', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    ebayProvider.clearTokenCacheForTesting();
    process.env = { ...originalEnv };
    delete process.env.EBAY_CLIENT_ID;
    delete process.env.EBAY_CLIENT_SECRET;
    delete process.env.EBAY_ENV;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Configuration & Credentials Safeguards', () => {
    it('reports isConfigured() as false when credentials are absent', () => {
      expect(ebayProvider.isConfigured()).toBe(false);
    });

    it('reports isConfigured() as true when client ID and secret are configured', () => {
      process.env.EBAY_CLIENT_ID = 'test-client-id';
      process.env.EBAY_CLIENT_SECRET = 'test-client-secret';
      expect(ebayProvider.isConfigured()).toBe(true);
    });

    it('returns unconfigured status on searchProducts without throwing', async () => {
      const res = await ebayProvider.searchProducts('macbook');
      expect(res.provider).toBe('ebay');
      expect(res.status).toBe('unconfigured');
      expect(res.products).toEqual([]);
    });

    it('returns safe failure on fetchOffer when unconfigured', async () => {
      const res = await ebayProvider.fetchOffer({ externalProductId: '12345' });
      expect(res.provider).toBe('ebay');
      expect(res.success).toBe(false);
      expect(res.errorMessage).toMatch(/credentials not configured/i);
    });
  });

  describe('Normalization & Price/Currency Policy', () => {
    it('returns null for null, empty or invalid items', () => {
      expect(ebayProvider.normalizeEbayItem(null)).toBeNull();
      expect(ebayProvider.normalizeEbayItem({})).toBeNull();
      expect(ebayProvider.normalizeEbayItem({ itemId: '123' })).toBeNull(); // Missing title & price
    });

    it('rejects items with invalid, non-numeric, or zero prices', () => {
      expect(
        ebayProvider.normalizeEbayItem({
          itemId: '123',
          title: 'Test',
          price: { value: '0', currency: 'USD' },
        })
      ).toBeNull();

      expect(
        ebayProvider.normalizeEbayItem({
          itemId: '123',
          title: 'Test',
          price: { value: '-15.00', currency: 'USD' },
        })
      ).toBeNull();

      expect(
        ebayProvider.normalizeEbayItem({
          itemId: '123',
          title: 'Test',
          price: { value: 'invalid_price', currency: 'USD' },
        })
      ).toBeNull();
    });

    it('preserves foreign currency (USD) and does NOT manufacture an arbitrary INR price', () => {
      const mockItem = {
        itemId: 'v1|987654321|0',
        title: 'Sony WH-1000XM5 Wireless Headphones',
        price: { value: '349.99', currency: 'USD' },
        itemWebUrl: 'https://www.ebay.com/itm/987654321',
        image: { imageUrl: 'https://i.ebayimg.com/images/sony.jpg' },
      };

      const normalized = ebayProvider.normalizeEbayItem(mockItem);
      expect(normalized).not.toBeNull();
      expect(normalized.id).toBe('ebay-v1|987654321|0');
      expect(normalized.title).toBe('Sony WH-1000XM5 Wireless Headphones');

      const offer = normalized.offers[0];
      expect(offer.currency).toBe('USD');
      expect(offer.originalCurrency).toBe('USD');
      expect(offer.originalPrice).toBe(349.99);
      // Minor currency units (cents): 349.99 * 100 = 34999
      expect(offer.priceInPaise).toBe(34999);
      expect(offer.crossCurrencyComparable).toBe(false);
      expect(offer.isSample).toBe(false);
      expect(offer.dataStatus).toBe('live');
    });

    it('sets crossCurrencyComparable: true when listing is genuinely in INR', () => {
      const mockItem = {
        itemId: 'v1|11223344|0',
        title: 'OnePlus 12 5G (Flowy Emerald)',
        price: { value: '64999.00', currency: 'INR' },
        itemWebUrl: 'https://www.ebay.com/itm/11223344',
      };

      const normalized = ebayProvider.normalizeEbayItem(mockItem);
      const offer = normalized.offers[0];
      expect(offer.currency).toBe('INR');
      expect(offer.originalCurrency).toBe('INR');
      expect(offer.priceInPaise).toBe(6499900);
      expect(offer.crossCurrencyComparable).toBe(true);
    });

    it('marks dataStatus as sample if EBAY_ENV is sandbox', () => {
      process.env.EBAY_ENV = 'sandbox';
      const mockItem = {
        itemId: 'v1|sandbox-item|0',
        title: 'Sandbox Test Item',
        price: { value: '10.00', currency: 'USD' },
        itemWebUrl: 'https://sandbox.ebay.com/itm/sandbox-item',
      };

      const normalized = ebayProvider.normalizeEbayItem(mockItem);
      expect(normalized.dataStatus).toBe('sample');
      expect(normalized.offers[0].isSample).toBe(true);
    });
  });

  describe('Diagnostic Access Verification', () => {
    it('returns sanitized unconfigured diagnostic when credentials are missing', async () => {
      const report = await ebayProvider.verifyAccess();
      expect(report.provider).toBe('ebay');
      expect(report.configured).toBe(false);
      expect(report.authStatus).toBe('unconfigured');
      expect(report.credentialsPresent.hasClientId).toBe(false);
      expect(report.credentialsPresent.hasClientSecret).toBe(false);
      // Ensure no raw token or password keys exist
      expect(report.token).toBeUndefined();
      expect(report.secret).toBeUndefined();
    });
  });
});
