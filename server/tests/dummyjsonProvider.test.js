import {
  normalizeDummyJsonProduct,
  searchProducts,
  getProductById,
  getCategories,
  fetchOffer,
  clearCacheForTesting,
} from '../src/providers/dummyjson.js';

describe('DummyJSON Provider Adapter (Multi-Provider Catalog Architecture)', () => {
  beforeEach(() => {
    clearCacheForTesting();
  });

  describe('normalizeDummyJsonProduct', () => {
    it('should return null for invalid or null inputs', () => {
      expect(normalizeDummyJsonProduct(null)).toBeNull();
      expect(normalizeDummyJsonProduct({})).toBeNull();
      expect(normalizeDummyJsonProduct({ title: 'No ID' })).toBeNull();
    });

    it('should normalize valid DummyJSON item into canonical format with integer paise', () => {
      const raw = {
        id: 101,
        title: 'Sample Test Smartphone',
        description: 'A test phone with high specs',
        category: 'smartphones',
        price: 199.99, // $199.99 USD
        brand: 'TestBrand',
        sku: 'TEST-SKU-101',
        stock: 15,
        availabilityStatus: 'In Stock',
        thumbnail: 'https://cdn.example.com/thumb.jpg',
        images: ['https://cdn.example.com/thumb.jpg', 'https://cdn.example.com/img2.jpg'],
      };

      const normalized = normalizeDummyJsonProduct(raw);

      expect(normalized).not.toBeNull();
      expect(normalized.id).toBe('dummyjson-101');
      expect(normalized.externalId).toBe('101');
      expect(normalized.title).toBe('Sample Test Smartphone');
      expect(normalized.brand).toBe('TestBrand');
      expect(normalized.model).toBe('TEST-SKU-101');
      expect(normalized.category).toBe('smartphones');
      expect(normalized.dataStatus).toBe('sample');
      expect(normalized.sourceProvider).toBe('dummyjson');
      expect(normalized.sourceUrl).toBe('https://dummyjson.com/products/101');

      // Verify integer paise conversion (199.99 * 83 * 100 = 1659917)
      expect(normalized.offers).toHaveLength(1);
      const offer = normalized.offers[0];
      expect(offer.provider).toBe('dummyjson');
      expect(Number.isInteger(offer.priceInPaise)).toBe(true);
      expect(offer.priceInPaise).toBe(1659917);
      expect(offer.originalPrice).toBe(199.99);
      expect(offer.originalCurrency).toBe('USD');
      expect(offer.currency).toBe('INR');
      expect(offer.isSample).toBe(true);
      expect(offer.dataStatus).toBe('sample');
      expect(offer.availability).toBe('in_stock');
    });

    it('should map zero stock or Out of Stock status to out_of_stock', () => {
      const rawZeroStock = {
        id: 102,
        title: 'Sold Out Item',
        price: 25.0,
        stock: 0,
        availabilityStatus: 'Out of Stock',
      };
      const normalized = normalizeDummyJsonProduct(rawZeroStock);
      expect(normalized.offers[0].availability).toBe('out_of_stock');
    });

    it('should handle zero or non-numeric price without throwing or producing NaN', () => {
      const rawInvalidPrice = {
        id: 103,
        title: 'Free Sample',
        price: 'not-a-number',
        stock: 5,
      };
      const normalized = normalizeDummyJsonProduct(rawInvalidPrice);
      expect(normalized.offers[0].priceInPaise).toBe(0);
      expect(Number.isInteger(normalized.offers[0].priceInPaise)).toBe(true);
    });
  });

  describe('searchProducts with caching and live/mock integration', () => {
    it('should handle empty or whitespace search queries gracefully', async () => {
      const result = await searchProducts('', { limit: 5 });
      expect(result).toBeDefined();
      expect(result.provider).toBe('dummyjson');
      expect(result.dataStatus).toBe('sample');
      expect(Array.isArray(result.products)).toBe(true);
    });

    it('should cache search results for identical queries', async () => {
      const first = await searchProducts('phone', { limit: 2 });
      const second = await searchProducts('phone', { limit: 2 });
      expect(first).toEqual(second);
    });

    it('should enforce bounds on limit parameter (between 1 and 50)', async () => {
      const resultMin = await searchProducts('watch', { limit: -5 });
      expect(resultMin.limit).toBe(1);

      const resultMax = await searchProducts('watch', { limit: 1000 });
      expect(resultMax.limit).toBe(50);
    });
  });

  describe('fetchOffer adapter for monitoring dispatcher', () => {
    it('should normalize fetched offer with isSample: true and dataStatus: "sample"', async () => {
      const offer = {
        provider: 'dummyjson',
        externalProductId: '1',
      };

      const result = await fetchOffer(offer);
      expect(result).toBeDefined();
      if (result.success) {
        expect(result.provider).toBe('dummyjson');
        expect(result.isSample).toBe(true);
        expect(result.dataStatus).toBe('sample');
        expect(typeof result.priceInPaise).toBe('number');
        expect(Number.isInteger(result.priceInPaise)).toBe(true);
      }
    });

    it('should handle non-existent product ID gracefully without throwing', async () => {
      const offer = {
        provider: 'dummyjson',
        externalProductId: '999999999',
      };

      const result = await fetchOffer(offer);
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });
  });
});
