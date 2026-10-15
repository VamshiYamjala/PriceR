// server/src/services/alertDispatcher.js
// Centralized notification dispatcher for price-drop alerts.
// Dispatches notifications across configured channels (email, telegram)
// and records immutable audit log entries in NotificationEvent.
// Strictly prevents unhandled promise rejections and handles duplicate dedupeKey suppression.

import User from '../models/User.js';
import NotificationEvent from '../models/NotificationEvent.js';
import { sendEmail } from './notifications/email.js';
import { sendMessage } from './notifications/telegram.js';

function maskEmail(email) {
  if (!email || typeof email !== 'string') return '[none]';
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) return `${name.charAt(0)}***@${domain}`;
  return `${name.charAt(0)}***${name.charAt(name.length - 1)}@${domain}`;
}



/**
 * Dispatches alert notifications to the user across all configured channels.
 * 
 * @param {object} params
 * @param {object} params.alert - Alert document or object
 * @param {object} params.offer - Offer document or object
 * @param {object} [params.user] - Optional pre-fetched user object
 * @param {object} params.evalResult - { reason, dedupeKey, conditionMet, shouldNotify }
 * @returns {Promise<Array<{channel: string, success: boolean, status: string, recipient?: string, providerMessageId?: string, errorMessage?: string}>>}
 */
export async function dispatchAlertNotifications({ alert, offer, user = null, evalResult }) {
  if (!alert || !offer || !evalResult) {
    return [];
  }

  // Fetch user if not provided or missing contact details
  let targetUser = user;
  const targetUserId = alert.userId?._id || alert.userId;
  if (!targetUser || !targetUser.email) {
    targetUser = await User.findById(targetUserId);
  }

  if (!targetUser) {
    console.warn(`[dispatcher] User not found for alert ${alert._id || alert.id}`);
    return [];
  }

  const channels = Array.isArray(alert.channels) && alert.channels.length > 0 ? alert.channels : ['email'];
  const isSampleOffer = Boolean(offer.isSample || offer.dataStatus === 'sample');
  const subjectTag = isSampleOffer ? '[PriceRadar Demo Alert]' : '[PriceRadar Alert]';
  const demoNotice = isSampleOffer
    ? '\n\n(Notice: This alert was triggered by a simulated sample/demo offer, not a verified live retailer drop.)'
    : '';

  const results = [];

  for (const channel of channels) {
    let sendResult = { success: false, errorMessage: null, providerMessageId: null, recipient: null };
    const message = `${evalResult.reason}${demoNotice}`;

    if (channel === 'email') {
      if (!targetUser.email) {
        sendResult = {
          success: false,
          recipient: null,
          errorMessage: 'User account has no valid email address configured.',
        };
      } else {
        console.log(`[dispatcher] Attempting email alert for alert ${alert._id || alert.id} to recipient ${maskEmail(targetUser.email)}...`);
        sendResult = await sendEmail({
          to: targetUser.email,
          subject: `${subjectTag} ${offer.title}`,
          text: `Hello ${targetUser.name || 'Shopper'},\n\n${evalResult.reason}${demoNotice}\n\nView offer: ${offer.productUrl}\n\nPriceRadar Team`,
        });
        if (sendResult.success) {
          console.log(`[dispatcher] ✅ Email accepted by Brevo for ${maskEmail(targetUser.email)} (Message ID: ${sendResult.providerMessageId})`);
        } else {
          console.warn(`[dispatcher] ❌ Email dispatch failed for ${maskEmail(targetUser.email)}: ${sendResult.errorMessage}`);
        }
      }
    } else if (channel === 'telegram') {
      if (targetUser.telegramChatId) {
        console.log(`[dispatcher] Attempting Telegram alert for alert ${alert._id || alert.id} to chat ${targetUser.telegramChatId}...`);
        sendResult = await sendMessage({
          chatId: targetUser.telegramChatId,
          text: `<b>${subjectTag}</b>\n\n${evalResult.reason}${demoNotice ? '<i>' + demoNotice + '</i>' : ''}\n\n<a href="${offer.productUrl}">View Offer</a>`,
        });
        sendResult.recipient = targetUser.telegramChatId;
        if (sendResult.success) {
          console.log(`[dispatcher] ✅ Telegram message sent to chat ${targetUser.telegramChatId}`);
        } else {
          console.warn(`[dispatcher] ❌ Telegram dispatch failed for chat ${targetUser.telegramChatId}: ${sendResult.errorMessage}`);
        }
      } else {
        sendResult = {
          success: false,
          recipient: null,
          errorMessage: 'User has not linked their Telegram account.',
        };
      }
    } else {
      sendResult = {
        success: false,
        recipient: null,
        errorMessage: `Unsupported notification channel: "${channel}"`,
      };
    }

    const eventStatus = sendResult.success ? 'sent' : 'failed';
    const recipient = channel === 'email' ? targetUser.email : (targetUser.telegramChatId || null);
    const dedupeKey = `${evalResult.dedupeKey}:${channel}`;

    try {
      await NotificationEvent.create({
        userId: targetUser._id,
        alertId: alert._id,
        channel,
        status: eventStatus,
        recipient,
        providerMessageId: sendResult.providerMessageId || undefined,
        message,
        errorMessage: sendResult.errorMessage || undefined,
        dedupeKey,
      });

      results.push({
        channel,
        success: sendResult.success,
        status: eventStatus,
        recipient,
        providerMessageId: sendResult.providerMessageId || null,
        errorMessage: sendResult.errorMessage || null,
      });
    } catch (eventErr) {
      if (eventErr.code === 11000) {
        console.log(`[dispatcher] Duplicate notification suppressed by dedupeKey index for alert ${alert._id || alert.id}`);
        results.push({
          channel,
          success: false,
          status: 'skipped_duplicate',
          recipient,
          errorMessage: 'Duplicate notification suppressed by deduplication index.',
        });
      } else {
        console.error('[dispatcher] Error recording NotificationEvent:', eventErr.message);
        results.push({
          channel,
          success: sendResult.success,
          status: eventStatus,
          recipient,
          providerMessageId: sendResult.providerMessageId || null,
          errorMessage: eventErr.message,
        });
      }
    }
  }

  return results;
}

export default { dispatchAlertNotifications };
