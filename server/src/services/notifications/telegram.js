// server/src/services/notifications/telegram.js
// Owner: Member 4
// sendMessage() delivers a real Telegram message via the Bot API and never throws.
// Includes long-polling listener and update processor for /start <code> account linking.

import '../../config/env.js';
import axios from 'axios';
import User from '../../models/User.js';
import { activeLinkCodes } from '../../routes/telegram.js';

function apiBase() {
  return `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
}

const REQUEST_TIMEOUT_MS = 10000;
let pollingTimer = null;
let lastUpdateId = 0;

/**
 * Diagnostic helper checking configuration status without exposing secrets.
 */
export function getTelegramConfigStatus() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'PriceRadar_Alerts_Bot';

  return {
    configured: Boolean(token && token.trim()),
    hasToken: Boolean(token && token.trim()),
    botUsername,
    botLink: `https://t.me/${botUsername}`,
  };
}

/**
 * Sends an HTML message to a Telegram chat.
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
      errorMessage: 'No telegramChatId on file for this user — they have not linked Telegram yet.',
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
 * Processes a single Telegram update for /start <code> account linking.
 * Exported so automated tests can invoke it with mock updates without network access.
 *
 * @param {object} update - Telegram update object
 * @returns {Promise<{linked: boolean, reason?: string, userId?: string}>}
 */
export async function processTelegramUpdate(update) {
  const msg = update?.message;
  if (!msg || !msg.text || !msg.chat) {
    return { linked: false, reason: 'No message text or chat' };
  }

  const text = msg.text.trim();
  const chatId = String(msg.chat.id);

  // Check if message is in format "/start <code>" or just "<code>"
  let code = null;
  if (text.startsWith('/start ')) {
    code = text.replace('/start ', '').trim().toUpperCase();
  } else if (/^[A-Z0-9]{6}$/i.test(text)) {
    code = text.toUpperCase();
  }

  if (!code) {
    if (text === '/start') {
      await sendMessage({
        chatId,
        text: '👋 <b>Welcome to PriceRadar!</b>\n\nTo connect your account, please click <b>Connect Telegram</b> on your PriceRadar Settings page, or send your 6-character linking code here.',
      });
      return { linked: false, reason: 'Plain /start without code' };
    }
    return { linked: false, reason: 'Unrecognized command' };
  }

  const entry = activeLinkCodes.get(code);
  if (!entry) {
    await sendMessage({
      chatId,
      text: '❌ <b>Invalid or Expired Code</b>\n\nThis linking code was not found or has already been used. Please generate a new code in your PriceRadar settings.',
    });
    return { linked: false, reason: 'Invalid or already used code' };
  }

  if (entry.expiresAt < new Date()) {
    activeLinkCodes.delete(code);
    await sendMessage({
      chatId,
      text: '⏱️ <b>Code Expired</b>\n\nThis linking code has expired. Please generate a fresh code in your PriceRadar settings.',
    });
    return { linked: false, reason: 'Code expired' };
  }

  // Code is valid! Link the account
  const user = await User.findById(entry.userId);
  if (!user) {
    activeLinkCodes.delete(code);
    return { linked: false, reason: 'User not found' };
  }

  user.telegramChatId = chatId;
  await user.save();
  activeLinkCodes.delete(code); // Single-use consumption

  await sendMessage({
    chatId,
    text: `✅ <b>PriceRadar Connected!</b>\n\nHello ${user.name}, your Telegram account is now successfully linked to receive instant price-drop alerts.`,
  });

  return { linked: true, userId: user._id.toString(), chatId };
}

let isPolling = false;
let pollingActive = false;

/**
 * Polls Telegram getUpdates once and processes incoming commands.
 */
export async function pollUpdatesOnce() {
  if (!process.env.TELEGRAM_BOT_TOKEN || isPolling) return [];
  isPolling = true;

  try {
    const res = await axios.get(`${apiBase()}/getUpdates`, {
      params: { offset: lastUpdateId + 1, timeout: 5 },
      timeout: 10000,
    });

    const updates = res.data?.result || [];
    for (const update of updates) {
      if (update.update_id) {
        lastUpdateId = Math.max(lastUpdateId, update.update_id);
      }
      await processTelegramUpdate(update);
    }
    return updates;
  } catch (err) {
    if (err.response?.status === 409) {
      console.warn('[telegram] Polling conflict detected (HTTP 409: active webhook or concurrent poll). Pausing polling listener.');
      stopLinkListener();
    }
    return [];
  } finally {
    isPolling = false;
  }
}

/**
 * Starts background polling listener for localhost development.
 * Uses recursive sequential loop to prevent overlapping requests.
 */
export function startLinkListener() {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;
  if (pollingActive) return;
  pollingActive = true;

  const pollLoop = async () => {
    if (!pollingActive) return;
    try {
      await pollUpdatesOnce();
    } catch {
      // safe fallback
    }
    if (pollingActive) {
      pollingTimer = setTimeout(pollLoop, 3000);
      if (pollingTimer && typeof pollingTimer.unref === 'function') {
        pollingTimer.unref();
      }
    }
  };

  pollLoop();
}

/**
 * Stops background polling listener.
 */
export function stopLinkListener() {
  pollingActive = false;
  if (pollingTimer) {
    clearTimeout(pollingTimer);
    pollingTimer = null;
  }
}

export function isPollingActive() {
  return pollingActive;
}

export default {
  sendMessage,
  getTelegramConfigStatus,
  processTelegramUpdate,
  pollUpdatesOnce,
  startLinkListener,
  stopLinkListener,
  isPollingActive,
};
