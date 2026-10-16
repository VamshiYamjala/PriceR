// server/src/services/notifications/email.js
// Owner: Member 4
// Sends a transactional email via Brevo's API. Never throws — every failure
// mode (bad API key, unverified sender, network error, rate limit) resolves
// to a result object the caller can log into a NotificationEvent
// (Document 1, Section 5.7) instead of crashing the monitoring cycle.

import axios from 'axios';
import { reloadEnv } from '../../config/env.js';

const BREVO_SEND_URL = 'https://api.brevo.com/v3/smtp/email';
const REQUEST_TIMEOUT_MS = 10000;

/**
 * Diagnostic helper that checks if Brevo configuration exists without exposing secret keys.
 */
export function getEmailConfigStatus() {
  if (process.env.NODE_ENV !== 'test' && (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM)) {
    reloadEnv();
  }
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  const fromAddress = (process.env.EMAIL_FROM || '').trim();
  const fromName = (process.env.EMAIL_FROM_NAME || 'PriceRadar').trim();

  return {
    configured: Boolean(apiKey && fromAddress),
    hasApiKey: Boolean(apiKey),
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
 * @returns {Promise<{success: boolean, providerMessageId?: string, recipient?: string, errorMessage?: string}>}
 */
export async function sendEmail({ to, subject, text, html }) {
  if (process.env.NODE_ENV !== 'test' && (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM)) {
    reloadEnv();
  }
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  const fromAddress = (process.env.EMAIL_FROM || '').trim();
  const fromName = (process.env.EMAIL_FROM_NAME || 'PriceRadar').trim();
  const recipient = (to || '').trim();

  if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    return {
      success: false,
      recipient: recipient || null,
      errorMessage: `Invalid recipient email address: "${to}".`,
    };
  }

  if (!apiKey || !fromAddress) {
    return {
      success: false,
      recipient,
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
        to: [{ email: recipient }],
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
      recipient,
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
      recipient,
      errorMessage: status
        ? `Brevo API error ${status}: ${detail}`
        : `Brevo API request failed: ${detail}`,
    };
  }
}

/**
 * Sends a 6-digit OTP verification email via Brevo.
 * @param {object} params
 * @param {string} params.to - recipient email
 * @param {string} params.otpCode - 6 digit numeric code
 * @param {string} [params.name] - recipient name
 * @param {string} [params.purpose] - verification purpose (e.g. 'Account Registration')
 */
export async function sendOtpEmail({ to, otpCode, name, purpose = 'Account Registration' }) {
  const recipientName = name ? name.trim() : 'Shopper';
  const subject = `Your PriceRadar Verification Code: ${otpCode}`;
  const text = `Hello ${recipientName},\n\nYour PriceRadar verification code for ${purpose} is: ${otpCode}\n\nThis code is valid for 10 minutes. If you did not request this verification code, please ignore this email.\n\n— The PriceRadar Team`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; border: 1px solid #E2E1DB; border-radius: 12px; background-color: #FAFBF8;">
      <div style="border-bottom: 2px solid #183C2B; padding-bottom: 16px; margin-bottom: 24px;">
        <h2 style="color: #183C2B; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">PriceRadar</h2>
      </div>
      <div style="background-color: #FFFFFF; border: 1px solid #E2E1DB; border-radius: 10px; padding: 24px; margin-bottom: 24px;">
        <h3 style="color: #17211B; font-size: 18px; margin-top: 0; margin-bottom: 12px;">Verify your email address</h3>
        <p style="font-size: 15px; color: #526058; line-height: 1.6; margin-bottom: 20px;">
          Hi ${recipientName}, please use the 6-digit code below to complete your PriceRadar ${purpose}.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background-color: #EAF2E6; border: 2px dashed #183C2B; border-radius: 8px; padding: 16px 36px;">
            <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #183C2B;">
              ${otpCode}
            </span>
          </div>
        </div>
        <p style="font-size: 13px; color: #526058; line-height: 1.5; margin-bottom: 0;">
          ⏳ This verification code expires in <strong>10 minutes</strong>. Never share this code with anyone.
        </p>
      </div>
      <div style="border-top: 1px solid #E2E1DB; padding-top: 16px; font-size: 12px; color: #738279; text-align: center;">
        <p style="margin: 0 0 6px 0;">PriceRadar — Real-time ecommerce price tracking and instant drop alerts.</p>
        <p style="margin: 0;">If you didn't request this code, you can safely ignore this email.</p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
}

export default { sendEmail, sendOtpEmail, getEmailConfigStatus };
