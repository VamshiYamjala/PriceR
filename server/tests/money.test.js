import { rupeesToPaise, paiseToRupees, formatRupees } from '../src/utils/money.js';

describe('Money Utilities (Document 1 Section 5)', () => {
  describe('rupeesToPaise', () => {
    it('should correctly convert integer rupees to paise', () => {
      expect(rupeesToPaise(100)).toBe(10000);
      expect(rupeesToPaise(14999)).toBe(1499900);
      expect(rupeesToPaise(0)).toBe(0);
    });

    it('should round floating point rupees to integer paise without float inaccuracies', () => {
      expect(rupeesToPaise(19.99)).toBe(1999);
      expect(rupeesToPaise(14.50)).toBe(1450);
      // Floating point arithmetic 0.1 + 0.2
      expect(rupeesToPaise(0.1 + 0.2)).toBe(30);
    });

    it('should throw TypeError when passed non-number or NaN values', () => {
      expect(() => rupeesToPaise(NaN)).toThrow(TypeError);
      expect(() => rupeesToPaise('100')).toThrow(TypeError);
      expect(() => rupeesToPaise(null)).toThrow(TypeError);
      expect(() => rupeesToPaise(undefined)).toThrow(TypeError);
      expect(() => rupeesToPaise({})).toThrow(TypeError);
    });
  });

  describe('paiseToRupees', () => {
    it('should correctly convert integer paise to rupees', () => {
      expect(paiseToRupees(10000)).toBe(100);
      expect(paiseToRupees(1499900)).toBe(14999);
      expect(paiseToRupees(0)).toBe(0);
    });

    it('should throw TypeError when given non-integer paise', () => {
      expect(() => paiseToRupees(100.5)).toThrow(TypeError);
      expect(() => paiseToRupees(1234.56)).toThrow(TypeError);
    });

    it('should throw TypeError when given non-number or NaN values', () => {
      expect(() => paiseToRupees(NaN)).toThrow(TypeError);
      expect(() => paiseToRupees('10000')).toThrow(TypeError);
      expect(() => paiseToRupees(null)).toThrow(TypeError);
      expect(() => paiseToRupees(undefined)).toThrow(TypeError);
    });
  });

  describe('formatRupees', () => {
    it('should format paise into Indian Rupee currency format string', () => {
      const formatted = formatRupees(1499900);
      // Normalizes non-breaking spaces if any from toLocaleString
      const cleaned = formatted.replace(/\u00a0/g, ' ');
      expect(cleaned).toMatch(/₹|Rs/);
      expect(cleaned).toContain('14,999');
    });

    it('should format zero paise correctly', () => {
      const formatted = formatRupees(0);
      expect(formatted).toContain('0');
    });
  });
});
