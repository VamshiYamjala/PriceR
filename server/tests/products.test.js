import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';

describe('Products & Search API (Connected Database)', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('GET /api/products/search with empty query should return empty products array', async () => {
    const res = await request(app).get('/api/products/search');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products).toEqual([]);
  });

  it('GET /api/products/search?q=Samsung should return matched products with populated offers', async () => {
    const res = await request(app).get('/api/products/search?q=Samsung');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.products)).toBe(true);
    expect(res.body.data.products.length).toBeGreaterThan(0);

    const firstProduct = res.body.data.products[0];
    expect(firstProduct).toHaveProperty('id');
    expect(firstProduct.title).toContain('Samsung');
    expect(Array.isArray(firstProduct.offers)).toBe(true);
    expect(firstProduct.offers.length).toBeGreaterThan(0);

    const firstOffer = firstProduct.offers[0];
    expect(firstOffer).toHaveProperty('provider');
    expect(firstOffer).toHaveProperty('priceInPaise');
    expect(typeof firstOffer.priceInPaise).toBe('number');
    expect(firstOffer.isSample).toBe(true);
  });

  it('GET /api/products/:productId should return complete product with offers', async () => {
    // Search first to get a valid product ID
    const searchRes = await request(app).get('/api/products/search?q=Redmi');
    expect(searchRes.body.data.products.length).toBeGreaterThan(0);
    const productId = searchRes.body.data.products[0].id;

    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product.id).toBe(productId);
    expect(Array.isArray(res.body.data.offers)).toBe(true);
    expect(res.body.data.offers.length).toBeGreaterThan(0);
  });

  it('GET /api/products/:productId with non-existent ID should return 404 NOT_FOUND', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/products/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
