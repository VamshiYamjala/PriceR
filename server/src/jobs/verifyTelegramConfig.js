// server/src/jobs/verifyTelegramConfig.js
// Safe Telegram configuration diagnostic and manual verification tool
// Reports configuration and tests bot token validity without exposing secrets.
// Sends a real test message ONLY when explicitly invoked with --send-test.

import '../config/env.js';
import axios from 'axios';
import { sendMessage, getTelegramConfigStatus } from '../services/notifications/telegram.js';

async function main() {
  const isSendTest = process.argv.includes('--send-test');
  const status = getTelegramConfigStatus();

  console.log('======================================================');
  console.log('🔍 PriceRadar — Telegram Bot Configuration Diagnostic');
  console.log('======================================================');
  console.log(`- TELEGRAM_BOT_TOKEN Configured: ${status.hasToken ? '✅ YES' : '❌ NO'}`);
  console.log(`- TELEGRAM_BOT_USERNAME:         ${status.botUsername}`);
  console.log(`- Bot Deep Link:                 ${status.botLink}`);

  if (!status.configured) {
    console.error('\n❌ Incomplete configuration: TELEGRAM_BOT_TOKEN is missing or blank in server/.env.');
    console.error('👉 Please paste your bot token into server/.env:');
    console.error('   TELEGRAM_BOT_TOKEN=<your_token_from_BotFather>');
    console.error('   TELEGRAM_BOT_USERNAME=PriceRadar_Alerts_Bot\n');
    process.exitCode = 1;
    return;
  }

  // Validate token with Telegram getMe API without exposing the token
  try {
    const res = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`, {
      timeout: 10000,
    });
    if (res.data?.ok) {
      const bot = res.data.result;
      console.log(`- Telegram API Bot Status:       ✅ ONLINE`);
      console.log(`- Verified Bot ID:               ${bot.id}`);
      console.log(`- Verified Bot First Name:       ${bot.first_name}`);
      console.log(`- Verified Bot Username:         @${bot.username}`);
    } else {
      console.error('\n❌ Telegram getMe returned unsuccessful response:', res.data);
      process.exitCode = 1;
      return;
    }
  } catch (err) {
    const detail = err.response?.data?.description || err.message;
    console.error('\n❌ Failed to connect to Telegram Bot API:');
    console.error(`   ${detail}`);
    process.exitCode = 1;
    return;
  }

  if (!isSendTest) {
    console.log('\n💡 Diagnostic Complete (No test message sent).');
    console.log('   To send a controlled test message, run:');
    console.log('   npm run telegram:test -- --chat-id=<YOUR_TELEGRAM_CHAT_ID>');
    return;
  }

  // Explicit test sending mode
  const chatIdArg = process.argv.find((arg) => arg.startsWith('--chat-id='));
  let targetChatId = chatIdArg ? chatIdArg.split('=')[1] : null;

  if (!targetChatId) {
    try {
      const mongoose = (await import('mongoose')).default;
      const User = (await import('../models/User.js')).default;
      await mongoose.connect(process.env.MONGODB_URI);
      const linkedUser = await User.findOne({ telegramChatId: { $ne: null } });
      if (linkedUser && linkedUser.telegramChatId) {
        targetChatId = linkedUser.telegramChatId;
        console.log(`\n🔍 Found linked user "${linkedUser.name}" (${linkedUser.email}) with chat ID: ${targetChatId}`);
      }
      await mongoose.disconnect();
    } catch {
      // safe fallback
    }
  }

  if (!targetChatId) {
    console.error('\n❌ Missing chat ID for test dispatch:');
    console.error('   No linked Telegram accounts found in database.');
    console.error('   Provide your chat ID using: npm run telegram:test -- --chat-id=<YOUR_CHAT_ID>');
    console.error('   Or link your Telegram account in the PriceRadar UI at http://localhost:5173/settings/notifications');
    process.exitCode = 1;
    return;
  }

  console.log(`\n🚀 Sending controlled test message to chat ID: ${targetChatId}...`);

  const result = await sendMessage({
    chatId: targetChatId,
    text: `🔔 <b>PriceRadar — Controlled Notification Test</b>\n\nYour Telegram bot integration is working properly!\n\nBot: @${status.botUsername}\nTimestamp: ${new Date().toISOString()}\nStatus: Verified Telegram Bot API Connection.`,
  });

  if (result.success) {
    console.log('✅ Test Telegram message successfully dispatched!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log('👉 Please check your Telegram chat with @' + status.botUsername);
  } else {
    console.error('❌ Test message delivery failed:');
    console.error(`   Error details: ${result.errorMessage}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
