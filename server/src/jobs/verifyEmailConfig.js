// server/src/jobs/verifyEmailConfig.js
// Safe email configuration diagnostic and manual verification tool (Prompt Phase 4 & 5)
// Reports credential configuration without exposing API secrets.
// Sends a real test email ONLY when explicitly invoked with --send-test.

import '../config/env.js';
import { sendEmail, getEmailConfigStatus } from '../services/notifications/email.js';

async function main() {
  const isSendTest = process.argv.includes('--send-test');
  const status = getEmailConfigStatus();

  console.log('======================================================');
  console.log('🔍 PriceRadar — Brevo Email Configuration Diagnostic');
  console.log('======================================================');
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  const isSmtpKey = apiKey.startsWith('xsmtpsib-');
  const isApiKey = apiKey.startsWith('xkeysib-');

  console.log(`- BREVO_API_KEY Configured: ${status.hasApiKey ? '✅ YES' : '❌ NO'} ${isSmtpKey ? '(⚠️ Warning: Key format is xsmtpsib- [SMTP password], requires xkeysib- [REST API key])' : isApiKey ? '(✅ Valid REST API key format: xkeysib-)' : ''}`);
  console.log(`- EMAIL_FROM Configured:    ${status.fromAddress ? `✅ YES (${status.fromAddress})` : '❌ NO'}`);
  console.log(`- EMAIL_FROM_NAME:          ${status.fromName}`);

  if (!status.configured) {
    console.error('\n❌ Incomplete configuration: Both BREVO_API_KEY and EMAIL_FROM must be set in server/.env.');
    process.exitCode = 1;
    return;
  }

  if (isSmtpKey) {
    console.log('\n⚠️  Credential Format Advisory:');
    console.log('   The configured BREVO_API_KEY begins with "xsmtpsib-", which is a Brevo SMTP password.');
    console.log('   Brevo\'s Transactional Email REST API endpoint requires an API key starting with "xkeysib-".');
    console.log('   To obtain your REST API key:');
    console.log('   1. Log into your Brevo account (https://app.brevo.com)');
    console.log('   2. Navigate to "SMTP & API" in the top-right profile menu');
    console.log('   3. Select the "API Keys" tab (not the SMTP tab)');
    console.log('   4. Click "Generate a new API key" and paste the "xkeysib-..." key into server/.env');
  }

  // Sender domain analysis
  const domain = status.fromAddress.split('@')[1] || '';
  if (domain.toLowerCase() === 'gmail.com') {
    console.log('\n📌 Deliverability Note:');
    console.log('   Sender is a @gmail.com address. In Brevo:');
    console.log('   1. Ensure this email address has been added and verified in Brevo Dashboard -> Senders.');
    console.log('   2. Since Gmail does not permit custom DKIM signing on third-party relays, Brevo will send');
    console.log('      via its authenticated shared relay. Check your Spam / Promotions tab if the email is not in Inbox.');
  }

  if (!isSendTest) {
    console.log('\n💡 Diagnostic Complete (No email was sent).');
    console.log('   To send a controlled test email to your account, run:');
    console.log('   npm run email:test');
    return;
  }

  // Explicit test sending mode
  let targetRecipient = process.argv.find((arg) => arg.startsWith('--to='))
    ? process.argv.find((arg) => arg.startsWith('--to=')).split('=')[1]
    : null;

  if (!targetRecipient && process.env.MONGODB_URI) {
    try {
      const mongoose = await import('mongoose');
      if (mongoose.default.connection.readyState === 0) {
        await mongoose.default.connect(process.env.MONGODB_URI);
      }
      const User = mongoose.default.models.User || mongoose.default.model('User', new mongoose.default.Schema({ email: String, name: String }));
      const user = await User.findOne().sort({ createdAt: -1 });
      if (user && user.email) {
        targetRecipient = user.email;
        console.log(`\n📌 Targeted registered PriceRadar account: ${user.email} (Pass --to=<email> to override)`);
      }
    } catch (_) {}
  }

  if (!targetRecipient) {
    targetRecipient = status.fromAddress;
  }

  console.log(`\n🚀 Sending controlled test email to: ${targetRecipient}...`);

  const result = await sendEmail({
    to: targetRecipient,
    subject: '[PriceRadar] Controlled Notification Verification Test',
    text: `Hello,\n\nThis is a verified test email from your local PriceRadar installation.\n\nSender: ${status.fromAddress}\nTimestamp: ${new Date().toISOString()}\nStatus: Verified Brevo Transactional API Connection.\n\nBest regards,\nPriceRadar Team`,
  });

  if (result.success) {
    console.log('✅ Test email successfully dispatched via Brevo!');
    console.log(`   Provider Message ID: ${result.providerMessageId}`);
    console.log('👉 Please check your inbox (and spam/promotions folder) at:', targetRecipient);
  } else {
    console.error('❌ Test email delivery failed:');
    console.error(`   Error details: ${result.errorMessage}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
