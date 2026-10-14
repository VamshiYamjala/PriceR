import { evaluateAlert } from '../src/services/alertEvaluator.js';

describe('Alert Evaluator Service (Document 1 Section 9)', () => {
  const baseAlert = {
    _id: '64a1b2c3d4e5f67890123456',
    userId: 'user123',
    offerId: 'offer123',
    status: 'active',
    armed: true,
  };

  describe('Target Price Alert (type: target_price)', () => {
    const targetAlert = {
      ...baseAlert,
      type: 'target_price',
      targetPriceInPaise: 1500000, // ₹15,000 target
    };

    it('should trigger notification when current price is exactly at target price', () => {
      const res = evaluateAlert(targetAlert, 1500000);
      expect(res.conditionMet).toBe(true);
      expect(res.shouldNotify).toBe(true);
      expect(res.shouldRearm).toBe(false);
      expect(res.reason).toContain('meeting your target');
      expect(res.dedupeKey).toBe('64a1b2c3d4e5f67890123456:1500000');
    });

    it('should trigger notification when current price is below target price', () => {
      const res = evaluateAlert(targetAlert, 1479900);
      expect(res.conditionMet).toBe(true);
      expect(res.shouldNotify).toBe(true);
      expect(res.shouldRearm).toBe(false);
    });

    it('should NOT trigger notification when current price is above target price', () => {
      const res = evaluateAlert(targetAlert, 1549900);
      expect(res.conditionMet).toBe(false);
      expect(res.shouldNotify).toBe(false);
      expect(res.shouldRearm).toBe(false);
    });
  });

  describe('Fixed Drop Alert (type: fixed_drop)', () => {
    const dropAlert = {
      ...baseAlert,
      type: 'fixed_drop',
      dropAmountInPaise: 200000, // ₹2,000 drop required
    };

    it('should trigger notification when price drop meets or exceeds drop amount', () => {
      // Prior price: 15,000; Current price: 13,000 -> drop: 2,000
      const res = evaluateAlert(dropAlert, 1300000, 1500000);
      expect(res.conditionMet).toBe(true);
      expect(res.shouldNotify).toBe(true);
      expect(res.reason).toContain('meeting your drop threshold');
    });

    it('should NOT trigger notification when price drop is below threshold', () => {
      // Prior price: 15,000; Current price: 14,000 -> drop: 1,000 (< 2,000)
      const res = evaluateAlert(dropAlert, 1400000, 1500000);
      expect(res.conditionMet).toBe(false);
      expect(res.shouldNotify).toBe(false);
    });

    it('should NOT trigger notification when price increases', () => {
      // Prior price: 13,000; Current price: 15,000
      const res = evaluateAlert(dropAlert, 1500000, 1300000);
      expect(res.conditionMet).toBe(false);
      expect(res.shouldNotify).toBe(false);
    });

    it('should NOT trigger notification when previous price is not provided', () => {
      const res = evaluateAlert(dropAlert, 1300000, null);
      expect(res.conditionMet).toBe(false);
      expect(res.shouldNotify).toBe(false);
    });
  });

  describe('Invalid and Zero Price Protection (Document 1 Section 10.6)', () => {
    const targetAlert = {
      ...baseAlert,
      type: 'target_price',
      targetPriceInPaise: 100000, // ₹1,000
    };

    it('must NEVER notify on zero price (e.g. provider failure or 0 rupees)', () => {
      const res = evaluateAlert(targetAlert, 0);
      expect(res.conditionMet).toBe(false);
      expect(res.shouldNotify).toBe(false);
      expect(res.reason).toContain('Invalid or non-positive price');
    });

    it('must NEVER notify on negative price', () => {
      const res = evaluateAlert(targetAlert, -500);
      expect(res.conditionMet).toBe(false);
      expect(res.shouldNotify).toBe(false);
    });

    it('must NEVER notify on non-number or NaN price', () => {
      expect(evaluateAlert(targetAlert, NaN).shouldNotify).toBe(false);
      expect(evaluateAlert(targetAlert, null).shouldNotify).toBe(false);
      expect(evaluateAlert(targetAlert, undefined).shouldNotify).toBe(false);
      expect(evaluateAlert(targetAlert, '100').shouldNotify).toBe(false);
    });
  });

  describe('Duplicate Suppression & Re-arming Lifecycle (Document 1 Section 9.3 & 9.4)', () => {
    const targetAlert = {
      ...baseAlert,
      type: 'target_price',
      targetPriceInPaise: 1500000, // ₹15,000
    };

    it('Hour 1: price ₹15,499 -> condition false, armed stays true, no notification', () => {
      const alertState = { ...targetAlert, armed: true };
      const res = evaluateAlert(alertState, 1549900);
      expect(res.conditionMet).toBe(false);
      expect(res.shouldNotify).toBe(false);
      expect(res.shouldRearm).toBe(false);
    });

    it('Hour 2: price drops to ₹14,799 -> condition true, armed is true -> shouldNotify: true', () => {
      const alertState = { ...targetAlert, armed: true };
      const res = evaluateAlert(alertState, 1479900);
      expect(res.conditionMet).toBe(true);
      expect(res.shouldNotify).toBe(true);
      expect(res.shouldRearm).toBe(false);
    });

    it('Hour 3: price ₹14,799 (unchanged) -> condition true, but armed: false -> DUPLICATE SUPPRESSED (shouldNotify: false)', () => {
      // Alert was disarmed after Hour 2 trigger
      const disarmedAlert = { ...targetAlert, armed: false };
      const res = evaluateAlert(disarmedAlert, 1479900);
      expect(res.conditionMet).toBe(true);
      expect(res.shouldNotify).toBe(false);
      expect(res.shouldRearm).toBe(false);
    });

    it('Hour 4: price rises back to ₹15,199 -> condition false -> RE-ARM (shouldRearm: true)', () => {
      const disarmedAlert = { ...targetAlert, armed: false };
      const res = evaluateAlert(disarmedAlert, 1519900);
      expect(res.conditionMet).toBe(false);
      expect(res.shouldNotify).toBe(false);
      expect(res.shouldRearm).toBe(true);
    });

    it('Hour 5: re-armed alert and price drops to ₹14,999 -> triggers notification again', () => {
      const rearmedAlert = { ...targetAlert, armed: true };
      const res = evaluateAlert(rearmedAlert, 1499900);
      expect(res.conditionMet).toBe(true);
      expect(res.shouldNotify).toBe(true);
    });
  });

  describe('Alert Status Inactive / Paused Handling', () => {
    it('should NOT notify if alert status is paused even if condition is met', () => {
      const pausedAlert = {
        ...baseAlert,
        type: 'target_price',
        targetPriceInPaise: 1500000,
        status: 'paused',
        armed: true,
      };
      const res = evaluateAlert(pausedAlert, 1400000);
      expect(res.conditionMet).toBe(true);
      expect(res.shouldNotify).toBe(false);
    });
  });
});
