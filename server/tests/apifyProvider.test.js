import { jest } from '@jest/globals';
import axios from 'axios';
import {
  getApifyConfig,
  formatActorIdForApi,
  parsePriceToPaise,
  normalizeApifyItem,
  buildActorInput,
  verifyToken,
  runActorSync,
  fetchOffer,
  searchProducts,
} from '../src/providers/apify.js';

describe('Apify Provider Adapter (Primary External Data Collection)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getApifyConfig', () => {
    it('should return unconfigured status when APIFY_API_TOKEN is absent', () => {
      delete process.env.APIFY_API_TOKEN;
      const config = getApifyConfig();
      expect(config.isConfigured).toBe(false);
      expect(config.token).toBe('');
      expect(config.maxItems).toBe(5);
      expect(config.timeoutSecs).toBe(60);
    });

    it('should read configured token, actor overrides, and limits from env', () => {
      process.env.APIFY_API_TOKEN = 'apify_api_testtoken123';
      process.env.APIFY_ACTOR_AMAZON = 'custom/amazon-actor';
      process.env.APIFY_MAX_ITEMS = '8';
      process.env.APIFY_TIMEOUT_SECS = '45';

      const config = getApifyConfig();
      expect(config.isConfigured).toBe(true);
      expect(config.token).toBe('apify_api_testtoken123');
      expect(config.actorAmazon).toBe('custom/amazon-actor');
      expect(config.maxItems).toBe(8);
      expect(config.timeoutSecs).toBe(45);
    });
  });

  describe('formatActorIdForApi', () => {
    it('should convert slashes to tildes for Apify REST API format', () => {
      expect(formatActorIdForApi('junglee/free-amazon-product-scraper')).toBe('junglee~free-amazon-product-scraper');
      expect(formatActorIdForApi('scrapeai/flipkart-scraper')).toBe('scrapeai~flipkart-scraper');
      expect(formatActorIdForApi('already~tilde-format')).toBe('already~tilde-format');
      expect(formatActorIdForApi('')).toBe('');
    });
  });

  describe('parsePriceToPaise', () => {
    it('should convert standard numeric rupee amounts to integer paise', () => {
      expect(parsePriceToPaise(1299)).toBe(129900);
      expect(parsePriceToPaise(49.5)).toBe(4950);
      expect(parsePriceToPaise(99999)).toBe(9999900);
    });

    it('should parse formatted strings with currency symbols and commas', () => {
      expect(parsePriceToPaise('₹ 1,299')).toBe(129900);
      expect(parsePriceToPaise('Rs. 4,999.50')).toBe(499950);
      expect(parsePriceToPaise('₹1,49,900')).toBe(14990000);
      expect(parsePriceToPaise('1299.00')).toBe(129900);
    });

    it('should parse nested price objects from various actor formats', () => {
      expect(parsePriceToPaise({ value: 2499, currency: 'INR' })).toBe(249900);
      expect(parsePriceToPaise({ amount: 1599.99, currency: 'INR' })).toBe(159999);
      expect(parsePriceToPaise({ price: '₹799' })).toBe(79900);
    });

    it('should strictly reject zero, negative, NaN, or non-numeric prices', () => {
      expect(parsePriceToPaise(0)).toBeNull();
      expect(parsePriceToPaise('0')).toBeNull();
      expect(parsePriceToPaise(-100)).toBeNull();
      expect(parsePriceToPaise('-₹500')).toBeNull();
      expect(parsePriceToPaise('N/A')).toBeNull();
      expect(parsePriceToPaise('Out of Stock')).toBeNull();
      expect(parsePriceToPaise(null)).toBeNull();
      expect(parsePriceToPaise(undefined)).toBeNull();
    });
  });

  describe('normalizeApifyItem', () => {
    it('should normalize Amazon actor raw record into canonical structure', () => {
      const raw = {
        asin: 'B0BDHX8Z63',
        title: 'boAt Airdopes 141 Bluetooth Truly Wireless Earbuds',
        price: { value: 1299, currency: 'INR' },
        originalPrice: { value: 4490, currency: 'INR' },
        url: 'https://www.amazon.in/dp/B0BDHX8Z63',
        thumbnailImage: 'https://m.media-amazon.com/images/I/71RF4-P0rKL._SL1500_.jpg',
        brand: 'boAt',
        inStock: true,
        category: 'Audio',
      };

      const normalized = normalizeApifyItem(raw, 'amazon');

      expect(normalized).not.toBeNull();
      expect(normalized.externalId).toBe('B0BDHX8Z63');
      expect(normalized.title).toBe('boAt Airdopes 141 Bluetooth Truly Wireless Earbuds');
      expect(normalized.retailer).toBe('amazon');
      expect(normalized.priceInPaise).toBe(129900);
      expect(normalized.originalPrice).toBe(4490);
      expect(normalized.currency).toBe('INR');
      expect(normalized.availability).toBe('in_stock');
      expect(normalized.productUrl).toBe('https://www.amazon.in/dp/B0BDHX8Z63');
      expect(normalized.isSample).toBe(false);
      expect(normalized.dataStatus).toBe('live');
    });

    it('should normalize Flipkart actor raw record', () => {
      const raw = {
        productId: 'MOBGXYZ123ABC',
        title: 'Apple iPhone 15 (Blue, 128 GB)',
        price: 65999,
        mrp: 79900,
        url: 'https://www.flipkart.com/apple-iphone-15/p/itm123',
        image: 'https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/apple.jpg',
        inStock: true,
      };

      const normalized = normalizeApifyItem(raw, 'flipkart');

      expect(normalized).not.toBeNull();
      expect(normalized.externalId).toBe('MOBGXYZ123ABC');
      expect(normalized.priceInPaise).toBe(6599900);
      expect(normalized.originalPrice).toBe(79900);
      expect(normalized.retailer).toBe('flipkart');
      expect(normalized.dataStatus).toBe('live');
    });

    it('should normalize Meesho actor raw record', () => {
      const raw = {
        id: 's-12345678',
        name: 'Cotton Casual Printed Kurti',
        discountedPrice: 399,
        price: 799,
        productUrl: 'https://www.meesho.com/cotton-kurti/p/12345678',
        imageUrl: 'https://images.meesho.com/images/products/123.jpg',
        inStock: false,
      };

      const normalized = normalizeApifyItem(raw, 'meesho');

      expect(normalized).not.toBeNull();
      expect(normalized.externalId).toBe('s-12345678');
      expect(normalized.title).toBe('Cotton Casual Printed Kurti');
      expect(normalized.priceInPaise).toBe(39900);
      expect(normalized.originalPrice).toBe(799);
      expect(normalized.availability).toBe('out_of_stock');
      expect(normalized.retailer).toBe('meesho');
    });

    it('should return null when item has no valid positive price', () => {
      const rawNoPrice = {
        asin: 'B0TESTASIN1',
        title: 'Unavailable Item',
        price: 0,
      };
      expect(normalizeApifyItem(rawNoPrice, 'amazon')).toBeNull();
    });

    it('should return null when item lacks an external identifier or title', () => {
      expect(normalizeApifyItem({ price: 1000 }, 'amazon')).toBeNull();
      expect(normalizeApifyItem({ asin: 'B0TEST', price: 1000, title: '' }, 'amazon')).toBeNull();
    });
  });

  describe('buildActorInput', () => {
    it('should build keyword search input for Amazon India', () => {
      const input = buildActorInput('amazon', 'bluetooth speaker', { limit: 5 });
      expect(input.categoryUrls).toBeDefined();
      expect(input.categoryUrls[0].url).toContain('https://www.amazon.in/s?k=bluetooth%20speaker');
      expect(input.maxItemsPerStartUrl).toBe(5);
      expect(input.scrapeProductDetails).toBe(false);
    });

    it('should build targeted single listing URL input for Amazon India refresh', () => {
      const input = buildActorInput('amazon', 'https://www.amazon.in/dp/B0BDHX8Z63', { isUrl: true, limit: 1 });
      expect(input.categoryUrls[0].url).toBe('https://www.amazon.in/dp/B0BDHX8Z63');
      expect(input.maxItemsPerStartUrl).toBe(1);
      expect(input.scrapeProductDetails).toBe(true);
    });

    it('should build keyword search input for Flipkart', () => {
      const input = buildActorInput('flipkart', 'running shoes', { limit: 4 });
      expect(input.keyword).toBe('running shoes');
      expect(input.results_wanted).toBe(4);
    });

    it('should build direct listing URL input for Flipkart refresh', () => {
      const input = buildActorInput('flipkart', 'https://www.flipkart.com/item/p/itm123', { isUrl: true });
      expect(input.startUrl).toBe('https://www.flipkart.com/item/p/itm123');
      expect(input.results_wanted).toBe(1);
    });

    it('should build keyword search input for Meesho', () => {
      const input = buildActorInput('meesho', 'saree', { limit: 6 });
      expect(input.mode).toBe('search');
      expect(input.search).toBe('saree');
      expect(input.maxItems).toBe(6);
    });
  });

  describe('verifyToken diagnostic API check', () => {
    it('should return unconfigured status when token is missing', async () => {
      delete process.env.APIFY_API_TOKEN;
      const res = await verifyToken();
      expect(res.configured).toBe(false);
      expect(res.valid).toBe(false);
      expect(res.errorMessage).toContain('APIFY_API_TOKEN is not set');
    });

    it('should return valid user account details when Apify API returns 200 OK', async () => {
      jest.spyOn(axios, 'get').mockResolvedValueOnce({
        data: {
          data: {
            id: 'usr_abc123',
            username: 'test_user',
            email: 'test@example.com',
            plan: { id: 'free', name: 'Personal Free' },
          },
        },
      });

      const res = await verifyToken('valid_token_sample');
      expect(res.configured).toBe(true);
      expect(res.valid).toBe(true);
      expect(res.username).toBe('test_user');
      expect(res.email).toBe('test@example.com');
      expect(res.plan).toBe('Personal Free');
    });

    it('should return descriptive invalid error when Apify API returns 401 Unauthorized', async () => {
      const error401 = new Error('Request failed with status code 401');
      error401.response = { status: 401 };
      jest.spyOn(axios, 'get').mockRejectedValueOnce(error401);

      const res = await verifyToken('invalid_token_sample');
      expect(res.configured).toBe(true);
      expect(res.valid).toBe(false);
      expect(res.errorMessage).toContain('HTTP 401 Unauthorized');
    });
  });

  describe('runActorSync execution', () => {
    it('should throw an error if API token is missing', async () => {
      delete process.env.APIFY_API_TOKEN;
      await expect(runActorSync('junglee/free-amazon-product-scraper', {})).rejects.toThrow(
        'APIFY_API_TOKEN is not configured.'
      );
    });

    it('should execute synchronous POST request to Apify API v2 endpoint', async () => {
      process.env.APIFY_API_TOKEN = 'apify_test_token';
      const mockItems = [{ asin: 'B0123', title: 'Test Product', price: 999 }];

      const postSpy = jest.spyOn(axios, 'post').mockResolvedValueOnce({
        data: mockItems,
      });

      const items = await runActorSync('junglee/free-amazon-product-scraper', { search: 'test' });
      expect(items).toEqual(mockItems);
      expect(postSpy).toHaveBeenCalledWith(
        expect.stringContaining('/actors/junglee~free-amazon-product-scraper/run-sync-get-dataset-items'),
        { search: 'test' },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer apify_test_token',
          }),
        })
      );
    });
  });

  describe('fetchOffer single-listing targeted refresh', () => {
    it('should return error when Apify token is unconfigured', async () => {
      delete process.env.APIFY_API_TOKEN;
      const result = await fetchOffer({ externalProductId: 'amazon-B0BDHX8Z63', productUrl: 'https://www.amazon.in/dp/B0BDHX8Z63' });
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Apify API token not configured');
    });

    it('should refresh single listing and return updated price in paise', async () => {
      process.env.APIFY_API_TOKEN = 'apify_test_token';

      jest.spyOn(axios, 'post').mockResolvedValueOnce({
        data: [
          {
            asin: 'B0BDHX8Z63',
            title: 'boAt Airdopes 141',
            price: 1199, // Dropped from 1299
            url: 'https://www.amazon.in/dp/B0BDHX8Z63',
            inStock: true,
          },
        ],
      });

      const result = await fetchOffer({
        externalProductId: 'amazon-B0BDHX8Z63',
        productUrl: 'https://www.amazon.in/dp/B0BDHX8Z63',
        priceInPaise: 129900,
      });

      expect(result.success).toBe(true);
      expect(result.priceInPaise).toBe(119900);
      expect(result.availability).toBe('in_stock');
      expect(result.dataStatus).toBe('live');
      expect(result.isSample).toBe(false);
    });

    it('should reject and return failure when Actor returns empty dataset', async () => {
      process.env.APIFY_API_TOKEN = 'apify_test_token';
      jest.spyOn(axios, 'post').mockResolvedValueOnce({ data: [] });

      const result = await fetchOffer({
        externalProductId: 'amazon-B0NONEXIST',
        productUrl: 'https://www.amazon.in/dp/B0NONEXIST',
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('empty dataset');
    });

    it('should reject and return failure when price is missing or zero (never corruption)', async () => {
      process.env.APIFY_API_TOKEN = 'apify_test_token';
      jest.spyOn(axios, 'post').mockResolvedValueOnce({
        data: [{ asin: 'B0TEST', title: 'Free Promo', price: 0 }],
      });

      const result = await fetchOffer({
        externalProductId: 'amazon-B0TEST',
        productUrl: 'https://www.amazon.in/dp/B0TEST',
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Failed to extract valid positive price');
    });
  });

  describe('searchProducts', () => {
    it('should report unconfigured status gracefully if token is missing', async () => {
      delete process.env.APIFY_API_TOKEN;
      const res = await searchProducts('wireless mouse');
      expect(res.configured).toBe(false);
      expect(res.products).toEqual([]);
      expect(res.total).toBe(0);
    });

    it('should return normalized products with offers when configured', async () => {
      process.env.APIFY_API_TOKEN = 'apify_test_token';

      jest.spyOn(axios, 'post').mockResolvedValueOnce({
        data: [
          {
            asin: 'B07W4D61VV',
            title: 'Logitech M170 Wireless Mouse',
            price: 649,
            url: 'https://www.amazon.in/dp/B07W4D61VV',
            inStock: true,
          },
        ],
      });

      const res = await searchProducts('Logitech mouse', { retailer: 'amazon' });
      expect(res.configured).toBe(true);
      expect(res.products).toHaveLength(1);

      const p = res.products[0];
      expect(p.canonicalKey).toBe('apify-amazon-b07w4d61vv');
      expect(p.title).toBe('Logitech M170 Wireless Mouse');
      expect(p.dataStatus).toBe('live');
      expect(p.isSample).toBe(false);
      expect(p.offers[0].priceInPaise).toBe(64900);
      expect(p.offers[0].provider).toBe('apify');
    });
  });
});
