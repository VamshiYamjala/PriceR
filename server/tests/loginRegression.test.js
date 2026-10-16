import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from '../src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Login Page & Auth Endpoint Regression Tests', () => {
  it('should verify LoginPage.jsx contains a visible, accessible Sign In button with type=submit', () => {
    const loginPagePath = path.resolve(__dirname, '../../client/src/pages/LoginPage.jsx');
    const content = fs.readFileSync(loginPagePath, 'utf-8');

    // Button must exist
    expect(content).toContain('id="login-submit-btn"');
    expect(content).toContain('type="submit"');
    // Button must display "Sign In" text
    expect(content).toContain('Sign In →');
    // Form must have onSubmit handler bound
    expect(content).toContain('onSubmit={handleSubmit}');
    // Loading state must be handled
    expect(content).toContain('Signing in…');
    expect(content).toContain('disabled={loading}');
    // Button must have explicit background color and not transparent
    expect(content).toContain("backgroundColor: 'var(--pr-forest)'");
  });

  it('should verify /api/health endpoint returns status: ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBeDefined();
  });

  it('should validate inputs on POST /api/auth/login and reject empty submissions', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    // Either 400 (validation) or 503 (database disconnected) depending on state
    expect([400, 503]).toContain(res.statusCode);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
  });
});
