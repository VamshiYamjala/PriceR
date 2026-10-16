// server/tests/diagnostics.test.js
import request from 'supertest';
import app from '../src/app.js';

describe('System Diagnostics API (/api/diagnostics)', () => {
  it('GET /api/diagnostics returns complete 9-category report with summary', async () => {
    const res = await request(app).get('/api/diagnostics');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data.summary).toBeDefined();
    expect(typeof data.summary.total).toBe('number');
    expect(typeof data.summary.passed).toBe('number');
    expect(typeof data.summary.failed).toBe('number');
    expect(['HEALTHY', 'WARNING', 'FAIL']).toContain(data.summary.overallStatus);

    // Verify all 9 required categories exist
    const expectedCategories = [
      'environment',
      'database',
      'authentication',
      'sources',
      'productApi',
      'watchlistAlerts',
      'notifications',
      'scheduler',
      'frontend',
    ];

    for (const cat of expectedCategories) {
      expect(data.categories[cat]).toBeDefined();
      expect(Array.isArray(data.categories[cat].checks)).toBe(true);
      expect(data.categories[cat].checks.length).toBeGreaterThan(0);
    }
  }, 25000);

  it('All diagnostic checks include standardized status badges and properties', async () => {
    const res = await request(app).get('/api/diagnostics');
    const allChecks = Object.values(res.body.data.categories).flatMap((c) => c.checks);

    const validStatuses = ['PASS', 'FAIL', 'WARNING', 'SKIPPED', 'NOT CONFIGURED'];

    for (const check of allChecks) {
      expect(typeof check.id).toBe('string');
      expect(typeof check.name).toBe('string');
      expect(typeof check.component).toBe('string');
      expect(validStatuses).toContain(check.status);
      expect(check.expected).toBeDefined();
      expect(check.actual).toBeDefined();
      expect(typeof check.durationMs).toBe('number');
    }
  });

  it('Security check: NEVER exposes secret values or tokens in diagnostic reports', async () => {
    const res = await request(app).get('/api/diagnostics');
    const rawJson = JSON.stringify(res.body);

    // Ensure raw secrets from environment are never exposed in the response
    if (process.env.JWT_SECRET) {
      expect(rawJson).not.toContain(process.env.JWT_SECRET);
    }
    if (process.env.BREVO_API_KEY) {
      expect(rawJson).not.toContain(process.env.BREVO_API_KEY);
    }
    if (process.env.TELEGRAM_BOT_TOKEN) {
      expect(rawJson).not.toContain(process.env.TELEGRAM_BOT_TOKEN);
    }
    if (process.env.APIFY_API_TOKEN) {
      expect(rawJson).not.toContain(process.env.APIFY_API_TOKEN);
    }
    if (process.env.MONGODB_URI) {
      // Should not contain credentials part of Mongo URI
      expect(rawJson).not.toContain('@cluster');
    }
  });

  it('GET /api/diagnostics/sources/ebay returns sanitized eBay diagnostic', async () => {
    const res = await request(app).get('/api/diagnostics/sources/ebay');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.provider).toBe('ebay');
    expect(res.body.data.credentialsPresent).toBeDefined();
  });

  it('GET /api/diagnostics/sources/apify returns sanitized Apify config', async () => {
    const res = await request(app).get('/api/diagnostics/sources/apify');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.provider).toBe('apify');
    expect(res.body.data.actors).toBeDefined();
  });

  describe('Production Environment Diagnostics Protection', () => {
    const originalEnv = process.env.NODE_ENV;
    const testSecret = 'test-admin-secret-xyz';

    beforeAll(() => {
      process.env.ADMIN_DIAGNOSTIC_SECRET = testSecret;
    });

    afterAll(() => {
      process.env.NODE_ENV = originalEnv;
      delete process.env.ADMIN_DIAGNOSTIC_SECRET;
    });

    it('should block unauthenticated diagnostics access in production with 403 DIAGNOSTICS_DISABLED', async () => {
      process.env.NODE_ENV = 'production';
      try {
        const res = await request(app).get('/api/diagnostics');
        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('DIAGNOSTICS_DISABLED');
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should allow access in production when valid X-Diagnostic-Secret is provided', async () => {
      process.env.NODE_ENV = 'production';
      try {
        const res = await request(app)
          .get('/api/diagnostics')
          .set('X-Diagnostic-Secret', testSecret);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    }, 25000);
  });
});
