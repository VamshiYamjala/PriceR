import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { setMonitorStateForTesting } from '../src/services/priceMonitor.js';

describe('Monitor Controller & Routes API (Document 1 Section 6.6)', () => {
  const MONITOR_SECRET = 'test-monitor-secret-abc-123';
  const JWT_SECRET = 'test-jwt-secret-key-32-chars-long';

  beforeAll(() => {
    process.env.MONITOR_TRIGGER_SECRET = MONITOR_SECRET;
    process.env.JWT_SECRET = JWT_SECRET;
    process.env.MONITORING_ENABLED = 'false'; // Prevent connecting to DB in unit test
  });

  describe('POST /api/monitor/run', () => {
    it('should reject request without X-Monitor-Secret header with 401 AUTH_INVALID', async () => {
      const res = await request(app).post('/api/monitor/run');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toHaveProperty('code', 'AUTH_INVALID');
    });

    it('should reject request with invalid X-Monitor-Secret header with 401 AUTH_INVALID', async () => {
      const res = await request(app)
        .post('/api/monitor/run')
        .set('X-Monitor-Secret', 'wrong-secret');
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toHaveProperty('code', 'AUTH_INVALID');
    });

    it('should accept request with valid X-Monitor-Secret and return 202 Accepted', async () => {
      const res = await request(app)
        .post('/api/monitor/run')
        .set('X-Monitor-Secret', MONITOR_SECRET);
      expect(res.statusCode).toBe(202);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('started', true);
      expect(res.body.data).toHaveProperty('offersChecked');
      expect(res.body.data).toHaveProperty('triggeredAlerts');
    });
  });

  describe('GET /api/monitor/status', () => {
    it('should reject unauthenticated request with 401 AUTH_REQUIRED', async () => {
      const res = await request(app).get('/api/monitor/status');
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toHaveProperty('code', 'AUTH_REQUIRED');
    });

    it('should return 200 with lastRun state for authenticated team member', async () => {
      const now = new Date().toISOString();
      setMonitorStateForTesting({
        lastRunAt: now,
        lastRunOffersChecked: 12,
        lastRunErrors: 0,
      });

      const token = jwt.sign({ sub: '507f1f77bcf86cd799439011' }, JWT_SECRET, { expiresIn: '1h' });
      const res = await request(app)
        .get('/api/monitor/status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toEqual({
        lastRunAt: now,
        lastRunOffersChecked: 12,
        lastRunErrors: 0,
      });
    });
  });
});
