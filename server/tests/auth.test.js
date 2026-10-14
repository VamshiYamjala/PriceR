import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';

describe('Authentication & Authorization API (Document 1 Section 6.1)', () => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123!';
  const testName = 'Test User';
  let authToken = '';
  let createdUserId = '';

  const hasDb = Boolean(process.env.MONGODB_URI);

  beforeAll(async () => {
    if (!hasDb) return;
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
  });

  afterAll(async () => {
    if (!hasDb) return;
    // Clean up test user
    if (createdUserId) {
      await User.findByIdAndDelete(createdUserId);
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe('POST /api/auth/register', () => {
    it('should validate inputs and reject short passwords (< 8 chars)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Shorty', email: 'short@example.com', password: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toContain('at least 8 characters');
    });

    it('should validate inputs and reject invalid email formats', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Invalid Email', email: 'not-an-email', password: testPassword });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should register a new user successfully, hash password, and return 201 without passwordHash', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: testName, email: testEmail, password: testPassword });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.name).toBe(testName);
      expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
      expect(res.body.data.user).not.toHaveProperty('password');
      expect(res.body.data.user).not.toHaveProperty('passwordHash');

      createdUserId = res.body.data.user.id;

      // Verify in DB directly that password was hashed
      const dbUser = await User.findById(createdUserId).select('+passwordHash');
      expect(dbUser).not.toBeNull();
      expect(dbUser.passwordHash).toBeDefined();
      expect(dbUser.passwordHash).not.toBe(testPassword);
      expect(dbUser.passwordHash.startsWith('$2')).toBe(true); // bcrypt hash format
    });

    it('should reject duplicate registration with 409 CONFLICT', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Duplicate User', email: testEmail, password: testPassword });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject login with wrong password with 401 AUTH_INVALID', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testEmail, password: 'WrongPassword456' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTH_INVALID');
    });

    it('should reject login for non-existent email with 401 AUTH_INVALID', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: testPassword });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTH_INVALID');
    });

    it('should log in with valid credentials and return JWT token and user profile', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testEmail, password: testPassword });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(typeof res.body.data.token).toBe('string');
      expect(res.body.data.user.email).toBe(testEmail.toLowerCase());

      authToken = res.body.data.token;
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile when authenticated with Bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe(createdUserId);
      expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
    });

    it('should reject request without token with 401 AUTH_REQUIRED', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.error.code).toBe('AUTH_REQUIRED');
    });

    it('should reject request with expired or invalid token with 401 AUTH_INVALID', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toBe(401);
      expect(res.body.error.code).toBe('AUTH_INVALID');
    });
  });
});
