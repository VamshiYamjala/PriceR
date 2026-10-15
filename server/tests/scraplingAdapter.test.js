import { jest } from '@jest/globals';
import axios from 'axios';
import { extractFromUrl, fetchOffer, isWorkerAvailable } from '../src/providers/scrapling.js';

describe('Scrapling Worker Adapter (Document Phase D & E)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.SCRAPLING_WORKER_URL = 'http://127.0.0.1:8000';
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('isWorkerAvailable() should return true when health check returns healthy', async () => {
    jest.spyOn(axios, 'get').mockResolvedValueOnce({
      data: { status: 'healthy' },
    });
    const available = await isWorkerAvailable();
    expect(available).toBe(true);
  });

  it('isWorkerAvailable() should return false when worker is unreachable', async () => {
    jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Connection refused'));
    const available = await isWorkerAvailable();
    expect(available).toBe(false);
  });

  it('extractFromUrl() should reject invalid or non-string URLs', async () => {
    const res = await extractFromUrl(null);
    expect(res.success).toBe(false);
    expect(res.dataStatus).toBe('unavailable');
    expect(res.errorMessage).toContain('Invalid or missing productUrl');
  });

  it('extractFromUrl() should return live normalized offer on valid worker response', async () => {
    jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        success: true,
        url: 'http://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html',
        title: 'A Light in the Attic',
        price_in_paise: 543500,
        original_price: 51.77,
        original_currency: 'GBP',
        currency: 'INR',
        availability: 'in_stock',
        image_url: 'http://books.toscrape.com/media/cache/2c/da/2cdad67c44b002e7ead0cc35693c0e8b.jpg',
        data_status: 'live',
        retrieved_at: '2026-10-14T12:00:00Z',
      },
    });

    const res = await extractFromUrl(
      'http://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html'
    );

    expect(res.success).toBe(true);
    expect(res.dataStatus).toBe('live');
    expect(res.isSample).toBe(false);
    expect(res.title).toBe('A Light in the Attic');
    expect(res.priceInPaise).toBe(543500);
    expect(res.currency).toBe('INR');
  });

  it('extractFromUrl() should handle worker error or invalid price without fabricating prices', async () => {
    jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        success: false,
        url: 'http://books.toscrape.com/empty',
        error: 'Price missing on page',
      },
    });

    const res = await extractFromUrl('http://books.toscrape.com/empty');
    expect(res.success).toBe(false);
    expect(res.dataStatus).toBe('unavailable');
    expect(res.errorMessage).toBe('Price missing on page');
    expect(res.priceInPaise).toBeUndefined();
  });

  it('fetchOffer() should format result with externalProductId for monitoring dispatcher', async () => {
    jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        success: true,
        url: 'http://books.toscrape.com/catalogue/book_1/index.html',
        title: 'Book 1',
        price_in_paise: 200000,
        original_price: 20.0,
        original_currency: 'GBP',
        currency: 'INR',
        availability: 'in_stock',
        data_status: 'live',
        retrieved_at: '2026-10-14T12:00:00Z',
      },
    });

    const offer = {
      provider: 'scrapling',
      externalProductId: 'scrapling-book-1',
      productUrl: 'http://books.toscrape.com/catalogue/book_1/index.html',
      originalCurrency: 'GBP',
    };

    const res = await fetchOffer(offer);
    expect(res.success).toBe(true);
    expect(res.externalProductId).toBe('scrapling-book-1');
    expect(res.dataStatus).toBe('live');
  });
});
