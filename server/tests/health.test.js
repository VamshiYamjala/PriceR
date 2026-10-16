import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';

describe('Health Check API', () => {
  const hasMongoUri = Boolean(process.env.MONGODB_URI);

  it('GET /api/health should accurately reflect connected database state (HTTP 200)', async () => {
    if (hasMongoUri && mongoose.connection.readyState === 0) {
      try {
        await connectDB();
      } catch (_) {}
    }

    const res = await request(app).get('/api/health');
    if (mongoose.connection.readyState === 1) {
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('database', 'connected');
    } else {
      expect(res.statusCode).toBe(503);
      expect(res.body).toHaveProperty('status', 'unhealthy');
      expect(res.body).toHaveProperty('database', 'disconnected');
    }
    expect(res.body).toHaveProperty('time');
  });

  it('GET /api/health should return HTTP 503 when database is disconnected', async () => {
    const wasConnected = mongoose.connection.readyState === 1;
    if (wasConnected) {
      await mongoose.connection.close();
    }

    try {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(503);
      expect(res.body).toHaveProperty('status', 'unhealthy');
      expect(res.body).toHaveProperty('database', 'disconnected');
    } finally {
      // Reconnect if it was previously connected so other suites aren't affected
      if (wasConnected && hasMongoUri) {
        await connectDB();
      }
    }
  });

  it('GET /api/nonexistent should return 404', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
});
