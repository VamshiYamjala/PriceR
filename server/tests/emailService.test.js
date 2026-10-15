import { jest } from '@jest/globals';
import axios from 'axios';
import { sendEmail, getEmailConfigStatus } from '../src/services/notifications/email.js';

describe('Brevo Email Notification Service (Document 1 Section 5.7 & Guide 4)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.BREVO_API_KEY = 'test-mock-api-key';
    process.env.EMAIL_FROM = 'alerts@priceradar.test';
    process.env.EMAIL_FROM_NAME = 'PriceRadar Test';
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getEmailConfigStatus() Diagnostic Helper', () => {
    it('should report configured true when credentials exist without exposing the key', () => {
      const status = getEmailConfigStatus();
      expect(status.configured).toBe(true);
      expect(status.hasApiKey).toBe(true);
      expect(status.fromAddress).toBe('alerts@priceradar.test');
      expect(status.fromName).toBe('PriceRadar Test');
      // Must not leak the actual API key string
      expect(status.apiKey).toBeUndefined();
    });

    it('should report configured false when BREVO_API_KEY is missing', () => {
      delete process.env.BREVO_API_KEY;
      const status = getEmailConfigStatus();
      expect(status.configured).toBe(false);
      expect(status.hasApiKey).toBe(false);
    });

    it('should report configured false when EMAIL_FROM is missing', () => {
      delete process.env.EMAIL_FROM;
      const status = getEmailConfigStatus();
      expect(status.configured).toBe(false);
    });
  });

  describe('sendEmail() Execution & Mocking', () => {
    it('should return failure when credentials are not configured without throwing', async () => {
      delete process.env.BREVO_API_KEY;
      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test Alert',
        text: 'Price dropped!',
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('BREVO_API_KEY or EMAIL_FROM is not configured');
    });

    it('should dispatch formatted payload to Brevo API and return providerMessageId', async () => {
      const postSpy = jest.spyOn(axios, 'post').mockResolvedValueOnce({
        status: 201,
        data: { messageId: '<mock-brevo-msg-id-12345@smtp-relay.brevo.com>' },
      });

      const result = await sendEmail({
        to: 'buyer@example.com',
        subject: '[PriceRadar Alert] Sony Headphones',
        text: 'Price dropped to ₹24,000.',
      });

      expect(result.success).toBe(true);
      expect(result.providerMessageId).toBe('<mock-brevo-msg-id-12345@smtp-relay.brevo.com>');

      expect(postSpy).toHaveBeenCalledTimes(1);
      const [url, payload, config] = postSpy.mock.calls[0];
      expect(url).toBe('https://api.brevo.com/v3/smtp/email');
      expect(config.headers['api-key']).toBe('test-mock-api-key');
      expect(payload.sender.email).toBe('alerts@priceradar.test');
      expect(payload.sender.name).toBe('PriceRadar Test');
      expect(payload.to).toEqual([{ email: 'buyer@example.com' }]);
      expect(payload.subject).toBe('[PriceRadar Alert] Sony Headphones');
      expect(payload.textContent).toBe('Price dropped to ₹24,000.');
      expect(payload.htmlContent).toContain('PriceRadar Alert');
    });

    it('should handle Brevo API HTTP errors gracefully without throwing', async () => {
      jest.spyOn(axios, 'post').mockRejectedValueOnce({
        response: {
          status: 401,
          data: { message: 'Key not found in account' },
        },
      });

      const result = await sendEmail({
        to: 'buyer@example.com',
        subject: 'Test Alert',
        text: 'Price dropped!',
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Brevo API error 401: Key not found in account');
    });

    it('should handle network timeouts or connection drops gracefully', async () => {
      jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('ETIMEDOUT: Connection timed out'));

      const result = await sendEmail({
        to: 'buyer@example.com',
        subject: 'Test Alert',
        text: 'Price dropped!',
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Brevo API request failed: ETIMEDOUT');
    });
  });
});
