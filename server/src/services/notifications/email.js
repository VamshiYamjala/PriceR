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
 * Diagnostic helper that checks if Brevo configuration exists without exposing secret keys.
 */
export function getEmailConfigStatus() {
  const apiKey = process.env.BREVO_API_KEY;
  const fromAddress = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME || 'PriceRadar';

  return {
    configured: Boolean(apiKey && apiKey.trim() && fromAddress && fromAddress.trim()),
    hasApiKey: Boolean(apiKey && apiKey.trim()),
    fromAddress: fromAddress || null,
    fromName,
  };
}

/**
 * Sends a transactional email notification via Brevo API.
 * @param {object} params
 * @param {string} params.to - recipient email address
 * @param {string} params.subject
 * @param {string} params.text - plain-text body
 * @param {string} [params.html] - optional HTML body; falls back to styled PriceRadar HTML template
 * @returns {Promise<{success: boolean, providerMessageId?: string, errorMessage?: string}>}
 */
export async function sendEmail({ to, subject, text, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromAddress = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME || 'PriceRadar';

  if (!apiKey || !fromAddress) {
    return {
      success: false,
      errorMessage: 'BREVO_API_KEY or EMAIL_FROM is not configured in server/.env.',
    };
  }

  // Construct styled default HTML template if none is provided
  const htmlContent =
    html ||
    `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E1DB; border-radius: 8px; background-color: #ffffff;">
      <div style="border-bottom: 2px solid #0F6E56; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="color: #0F6E56; margin: 0; font-size: 22px;">PriceRadar Alert</h2>
      </div>
      <div style="font-size: 15px; line-height: 1.6; color: #1C1C1A; margin-bottom: 24px;">
        ${text.replace(/\n/g, '<br/>')}
      </div>
      <div style="border-top: 1px solid #ECECE8; padding-top: 16px; font-size: 12px; color: #6B6B66;">
        <p style="margin: 0;">This is an automated alert from PriceRadar. You received this email because you subscribed to a price alert on your account.</p>
      </div>
    </div>
  `;

  try {
    const response = await axios.post(
      BREVO_SEND_URL,
      {
        sender: { email: fromAddress, name: fromName },
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent,
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
    let detail =
      err.response?.data?.message || err.message || 'Unknown Brevo API error';

    if (status === 401 && apiKey.startsWith('xsmtpsib-')) {
      detail = `${detail}. Note: The configured BREVO_API_KEY starts with 'xsmtpsib-' which is an SMTP password. Brevo REST API requires an API key starting with 'xkeysib-' from Brevo Console -> SMTP & API -> API Keys tab.`;
    }

    return {
      success: false,
      errorMessage: status
        ? `Brevo API error ${status}: ${detail}`
        : `Brevo API request failed: ${detail}`,
    };
  }
}

export default { sendEmail, getEmailConfigStatus };
