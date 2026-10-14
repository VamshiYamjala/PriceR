// server/src/services/notifications/email.js
// Owner: Member 4
// Sends a transactional email via Brevo's API. Never throws — every failure
// mode (bad API key, unverified sender, network error, rate limit) resolves
// to a result object the caller can log into a NotificationEvent
// (Document 1, Section 5.7) instead of crashing the monitoring cycle.

import axios from 'axios';

const BREVO_SEND_URL = 'https://api.brevo.com/v3/smtp/email';
const REQUEST_TIMEOUT_MS = 10000;

/**
 * Sends a transactional email notification via Brevo API.
 * @param {object} params
 * @param {string} params.to - recipient email address
 * @param {string} params.subject
 * @param {string} params.text - plain-text body
 * @param {string} [params.html] - optional HTML body; falls back to a simple wrap of `text`
 * @returns {Promise<{success: boolean, providerMessageId?: string, errorMessage?: string}>}
 */
export async function sendEmail({ to, subject, text, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromAddress = process.env.EMAIL_FROM;

  if (!apiKey || !fromAddress) {
    return {
      success: false,
      errorMessage: 'BREVO_API_KEY or EMAIL_FROM is not configured in server/.env.',
    };
  }

  try {
    const response = await axios.post(
      BREVO_SEND_URL,
      {
        sender: { email: fromAddress, name: 'PriceRadar Alerts' },
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent: html || `<p>${text}</p>`,
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: REQUEST_TIMEOUT_MS,
      }
    );

    return {
      success: true,
      providerMessageId: response.data?.messageId || null,
    };
  } catch (err) {
    const status = err.response ? err.response.status : null;
    const detail =
      err.response?.data?.message || err.message || 'Unknown Brevo API error';
    return {
      success: false,
      errorMessage: status
        ? `Brevo API error ${status}: ${detail}`
        : `Brevo API request failed: ${detail}`,
    };
  }
}

export default { sendEmail };
