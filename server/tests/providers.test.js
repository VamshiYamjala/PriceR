import { fetchOffer } from '../src/providers/index.js';
import { evaluateAlert } from '../src/services/alertEvaluator.js';

describe('Retailer Providers & Failure Safety (Document 1 Section 10 & ACC-06)', () => {
  it('should fetch a sample fixture offer with simulated delay and return isSample: true', async () => {
    const offer = {
      provider: 'flipkart',
      externalProductId: 'FLP-SGM14-128-SLV',
      title: 'SAMSUNG Galaxy M14 5G',
      priceInPaise: 1349900,
      isSample: true,
    };

    const res = await fetchOffer(offer);
    expect(res.success).toBe(true);
    expect(res.isSample).toBe(true);
    expect(res.provider).toBe('flipkart');
    expect(typeof res.priceInPaise).toBe('number');
    expect(res.priceInPaise).toBeGreaterThan(0);
    expect(res).toHaveProperty('fetchedAt');
  });

  it('Amazon provider should route isSample: true to fixture data successfully', async () => {
    const offer = {
      provider: 'amazon',
      externalProductId: 'AMZ-SGM14-128-SLV',
      title: 'Samsung Galaxy M14 5G',
      priceInPaise: 1369900,
      isSample: true,
    };

    const res = await fetchOffer(offer);
    expect(res.success).toBe(true);
    expect(res.isSample).toBe(true);
    expect(res.provider).toBe('amazon');
  });

  it('Amazon provider policy: Non-sample Amazon call must be rejected (live scraping strictly forbidden)', async () => {
    const nonSampleOffer = {
      provider: 'amazon',
      externalProductId: 'AMZ-SGM14-128-SLV',
      isSample: false,
    };

    const res = await fetchOffer(nonSampleOffer);
    expect(res.success).toBe(false);
    expect(res.errorMessage).toContain('Amazon has no live provider');
  });

  it('ACC-06: FLP-NOISE-PULSE2-BLK forceFail should return success: false without returning a price of 0', async () => {
    const failureOffer = {
      provider: 'flipkart',
      externalProductId: 'FLP-NOISE-PULSE2-BLK',
      title: 'Noise Pulse 2 Max',
      priceInPaise: 199900,
      isSample: true,
    };

    const res = await fetchOffer(failureOffer);
    expect(res.success).toBe(false);
    expect(res.priceInPaise).toBeUndefined(); // Must NOT be 0!
    expect(res).toHaveProperty('errorMessage');
  });

  it('ACC-06 Safety Net: Failed provider call must NEVER trigger false price-drop alerts', () => {
    const alert = {
      _id: '64a1b2c3d4e5f67890123456',
      type: 'target_price',
      targetPriceInPaise: 1500000,
      status: 'active',
      armed: true,
    };

    // Simulated failed fetch returning 0 or undefined
    const evalZero = evaluateAlert(alert, 0);
    expect(evalZero.shouldNotify).toBe(false);
    expect(evalZero.conditionMet).toBe(false);

    const evalUndefined = evaluateAlert(alert, undefined);
    expect(evalUndefined.shouldNotify).toBe(false);
    expect(evalUndefined.conditionMet).toBe(false);
  });
});
