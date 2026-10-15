// server/src/jobs/verifyApifyConfig.js
// Safe Apify configuration diagnostic and live smoke testing tool.
// Reports configuration and tests Apify API token validity without exposing secrets.
// Optionally runs a live test search when invoked with --test-search="<query>".

import '../config/env.js';
import { getApifyConfig, verifyToken, searchProducts } from '../providers/apify.js';

async function main() {
  const config = getApifyConfig();
  const testSearchArg = process.argv.find((a) => a.startsWith('--test-search='));
  const testQuery = testSearchArg ? testSearchArg.split('=')[1] : null;

  console.log('======================================================');
  console.log('🔍 PriceRadar — Apify Platform Configuration Diagnostic');
  console.log('======================================================');
  console.log(`- APIFY_API_TOKEN Configured: ${config.isConfigured ? '✅ YES' : '❌ NO'}`);
  console.log(`- Amazon India Actor:         ${config.actorAmazon}`);
  console.log(`- Flipkart Actor:             ${config.actorFlipkart}`);
  console.log(`- Meesho Actor:               ${config.actorMeesho}`);
  console.log(`- Max Items Per Search:       ${config.maxItems}`);
  console.log(`- Actor Run Timeout:          ${config.timeoutSecs}s`);

  if (!config.isConfigured) {
    console.error('\n❌ Incomplete configuration: APIFY_API_TOKEN is missing or blank in server/.env.');
    console.error('👉 How to configure Apify:');
    console.error('   1. Sign up or log in at https://console.apify.com');
    console.error('   2. Navigate to Settings -> Integrations -> API Tokens (https://console.apify.com/account/integrations)');
    console.error('   3. Copy your Personal API token');
    console.error('   4. Add it to server/.env:');
    console.error('      APIFY_API_TOKEN=<your_apify_api_token>\n');
    process.exitCode = 1;
    return;
  }

  // Verify the token with Apify users/me endpoint
  console.log('\n📡 Verifying API token with Apify API (https://api.apify.com/v2/users/me)...');
  const verifyRes = await verifyToken();

  if (!verifyRes.valid) {
    console.error('\n❌ Apify token verification failed:');
    console.error(`   ${verifyRes.errorMessage}`);
    process.exitCode = 1;
    return;
  }

  console.log('✅ Apify API Token Status:      ONLINE & VALID');
  console.log(`- Verified User ID:             ${verifyRes.userId}`);
  console.log(`- Username:                     ${verifyRes.username}`);
  console.log(`- Account Email:                ${verifyRes.email}`);
  console.log(`- Subscription Plan:            ${verifyRes.plan}`);

  if (!testQuery) {
    console.log('\n💡 Diagnostic Complete (No live search run).');
    console.log('   To test a live product search against Apify, run:');
    console.log('   npm run apify:test -- --test-search="wireless headphones"');
    return;
  }

  // Live test search mode
  console.log(`\n🚀 Executing live test search for: "${testQuery}" (Retailer: Amazon India, Limit: ${config.maxItems})...`);
  const searchRes = await searchProducts(testQuery, { retailer: 'amazon', limit: config.maxItems });

  if (searchRes.products && searchRes.products.length > 0) {
    console.log(`✅ Live search succeeded! Retrieved ${searchRes.products.length} genuine product(s):`);
    searchRes.products.forEach((p, idx) => {
      const offer = p.offers?.[0];
      const priceFormatted = offer ? `₹${(offer.priceInPaise / 100).toLocaleString('en-IN')}` : 'N/A';
      console.log(`   [${idx + 1}] ${p.title.slice(0, 50)}... | Price: ${priceFormatted} | URL: ${offer?.productUrl?.slice(0, 45)}...`);
    });
  } else {
    console.warn('⚠️ Search completed but returned 0 products.');
    if (searchRes.error) {
      console.error(`   Error details: ${searchRes.error}`);
    }
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
