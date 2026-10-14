import { findLowestOffer, calculateSavings } from '../src/services/priceComparison.js';

describe('Price Comparison Service (Document 1 Section 13.4)', () => {
  describe('findLowestOffer', () => {
    it('should return null for empty or invalid offers input', () => {
      expect(findLowestOffer([])).toBeNull();
      expect(findLowestOffer(null)).toBeNull();
      expect(findLowestOffer(undefined)).toBeNull();
      expect(findLowestOffer('not an array')).toBeNull();
    });

    it('should select the offer with the lowest price among available offers', () => {
      const offers = [
        { provider: 'flipkart', priceInPaise: 1549900, availability: 'in_stock', lastStatus: 'ok' },
        { provider: 'amazon', priceInPaise: 1479900, availability: 'in_stock', lastStatus: 'ok' },
      ];
      const lowest = findLowestOffer(offers);
      expect(lowest).not.toBeNull();
      expect(lowest.provider).toBe('amazon');
      expect(lowest.priceInPaise).toBe(1479900);
    });

    it('should ignore out_of_stock offers even if they have a lower price', () => {
      const offers = [
        { provider: 'flipkart', priceInPaise: 1200000, availability: 'out_of_stock', lastStatus: 'ok' },
        { provider: 'amazon', priceInPaise: 1479900, availability: 'in_stock', lastStatus: 'ok' },
      ];
      const lowest = findLowestOffer(offers);
      expect(lowest).not.toBeNull();
      expect(lowest.provider).toBe('amazon');
      expect(lowest.priceInPaise).toBe(1479900);
    });

    it('should ignore offers with lastStatus === "error" even if they have a lower price', () => {
      const offers = [
        { provider: 'flipkart', priceInPaise: 1100000, availability: 'in_stock', lastStatus: 'error' },
        { provider: 'amazon', priceInPaise: 1479900, availability: 'in_stock', lastStatus: 'ok' },
      ];
      const lowest = findLowestOffer(offers);
      expect(lowest).not.toBeNull();
      expect(lowest.provider).toBe('amazon');
      expect(lowest.priceInPaise).toBe(1479900);
    });

    it('should accept offers with availability "unknown" if status is not error', () => {
      const offers = [
        { provider: 'flipkart', priceInPaise: 1350000, availability: 'unknown', lastStatus: 'ok' },
        { provider: 'amazon', priceInPaise: 1450000, availability: 'in_stock', lastStatus: 'ok' },
      ];
      const lowest = findLowestOffer(offers);
      expect(lowest).not.toBeNull();
      expect(lowest.provider).toBe('flipkart');
      expect(lowest.priceInPaise).toBe(1350000);
    });

    it('should return null if all offers are out of stock or in error state', () => {
      const offers = [
        { provider: 'flipkart', priceInPaise: 1200000, availability: 'out_of_stock', lastStatus: 'ok' },
        { provider: 'amazon', priceInPaise: 1100000, availability: 'in_stock', lastStatus: 'error' },
      ];
      expect(findLowestOffer(offers)).toBeNull();
    });
  });

  describe('calculateSavings', () => {
    it('should calculate correct paise difference and percentage savings', () => {
      // 15,000 base, 12,000 compared -> saves 3,000 (20%)
      const savings = calculateSavings(1500000, 1200000);
      expect(savings.savingsInPaise).toBe(300000);
      expect(savings.savingsPercent).toBe(20.0);
    });

    it('should return 0 savings when compared price is higher or equal to base price', () => {
      const savingsEqual = calculateSavings(1500000, 1500000);
      expect(savingsEqual.savingsInPaise).toBe(0);
      expect(savingsEqual.savingsPercent).toBe(0);

      const savingsHigher = calculateSavings(1500000, 1800000);
      expect(savingsHigher.savingsInPaise).toBe(0);
      expect(savingsHigher.savingsPercent).toBe(0);
    });

    it('should safely handle 0 base price without division by zero', () => {
      const savings = calculateSavings(0, 1000);
      expect(savings.savingsInPaise).toBe(0);
      expect(savings.savingsPercent).toBe(0);
    });
  });
});
