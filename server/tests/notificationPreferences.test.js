import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';

describe('Notification Preferences Route Mounting & Auth API', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-32-chars-long';
  process.env.JWT_SECRET = JWT_SECRET;

  it('GET /api/notification-preferences should reject unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/notification-preferences');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'AUTH_REQUIRED');
  });

  it('PUT /api/notification-preferences should reject unauthenticated request with 401', async () => {
    const res = await request(app).put('/api/notification-preferences').send({ email: 'test@example.com' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'AUTH_REQUIRED');
  });

  it('GET /api/notifications should reject unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'AUTH_REQUIRED');
  });

  it('GET /api/notification-preferences should reject malformed or invalid token with 401 AUTH_INVALID', async () => {
    const res = await request(app)
      .get('/api/notification-preferences')
      .set('Authorization', 'Bearer invalid-token-string');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toHaveProperty('code', 'AUTH_INVALID');
  });

  it('PUT /api/notification-preferences should validate email format and reject invalid emails with 400 VALIDATION_ERROR', async () => {
    const validToken = jwt.sign({ sub: '507f1f77bcf86cd799439011' }, JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app)
      .put('/api/notification-preferences')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ email: 'not-a-valid-email' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(res.body.error.message).toContain('Please provide a valid email address');
  });
});
