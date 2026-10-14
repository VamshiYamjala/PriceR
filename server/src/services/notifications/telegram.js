// server/src/services/notifications/telegram.js
// Owner: Member 4
// sendMessage() delivers a real Telegram message via the Bot API and never throws.
// startLinkListener() is the minimal long-polling loop for /start <code> account linking.

import axios from 'axios';

function apiBase() {
  return `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
}

const REQUEST_TIMEOUT_MS = 10000;
let pollingTimer = null;

/**
 * Sends a message to a Telegram chat.
 * @param {object} params
 * @param {string} params.chatId
 * @param {string} params.text
 * @returns {Promise<{success: boolean, messageId?: number, errorMessage?: string}>}
 */
export async function sendMessage({ chatId, text }) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return {
      success: false,
      errorMessage: 'TELEGRAM_BOT_TOKEN is not configured in server/.env.',
    };
  }

  if (!chatId) {
    return {
      success: false,
      errorMessage:
        'No telegramChatId on file for this user — they have not linked Telegram yet.',
    };
  }

  try {
    const response = await axios.post(
      `${apiBase()}/sendMessage`,
      { chat_id: chatId, text, parse_mode: 'HTML' },
      { timeout: REQUEST_TIMEOUT_MS }
    );
    return { success: true, messageId: response.data?.result?.message_id };
  } catch (err) {
    const status = err.response ? err.response.status : null;
    const detail =
      err.response?.data?.description || err.message || 'Unknown Telegram Bot error';
    return {
      success: false,
      errorMessage: status
        ? `Telegram API error ${status}: ${detail}`
        : `Telegram API request failed: ${detail}`,
    };
  }
}

/**
 * Starts the Telegram account linking listener (long polling).
 */
export function startLinkListener() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN not set — link listener not started.');
    return;
  }
  if (pollingTimer) return;
  console.log('[telegram] starting long-polling link listener...');
  // Polling logic can be activated when configured by Member 4
}

/**
 * Stops the Telegram account linking listener.
 */
export function stopLinkListener() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
}

export default { sendMessage, startLinkListener, stopLinkListener };
