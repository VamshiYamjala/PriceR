// server/src/jobs/seedFixtures.js
// Owner: Member 3 & Member 4
// Database Seeder: Seeds Product and Offer collections idempotently from fixtureData.json.
// Safe to re-run: Uses upsert (findOneAndUpdate) keyed by canonicalKey and (provider, externalProductId).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Offer from '../models/Offer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env explicitly
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

export async function seedFixtures(options = {}) {
  const mongoUri = options.mongoUri || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ [seeder] Error: MONGODB_URI is not set in server/.env.');
    console.error('👉 Please configure your MongoDB Atlas connection string first.');
    if (options.throwOnError) throw new Error('MONGODB_URI_MISSING');
    process.exit(1);
  }

  // Production protection safeguard
  const isProduction = process.env.NODE_ENV === 'production';
  const forceProd = process.argv.includes('--force-production') || options.forceProduction;
  if (isProduction && !forceProd) {
    console.error('⚠️ [seeder] Refusing to seed production database without --force-production flag.');
    if (options.throwOnError) throw new Error('PRODUCTION_PROTECTION');
    process.exit(1);
  }

  const fixtureFilePath = path.resolve(__dirname, '../providers/fixtureData.json');
  if (!fs.existsSync(fixtureFilePath)) {
    console.error(`❌ [seeder] Fixture file not found at: ${fixtureFilePath}`);
    if (options.throwOnError) throw new Error('FIXTURE_NOT_FOUND');
    process.exit(1);
  }

  const rawData = fs.readFileSync(fixtureFilePath, 'utf-8');
  const productsData = JSON.parse(rawData);

  let connectedLocally = false;
  if (mongoose.connection.readyState === 0) {
    console.log('[seeder] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    connectedLocally = true;
    console.log('[seeder] Connected successfully.');
  }

  let productsCount = 0;
  let offersCount = 0;

  try {
    for (const item of productsData) {
      // Upsert Product by unique canonicalKey
      const product = await Product.findOneAndUpdate(
        { canonicalKey: item.canonicalKey.toLowerCase().trim() },
        {
          title: item.title.trim(),
          brand: item.brand,
          model: item.model,
          variant: item.variant,
          canonicalKey: item.canonicalKey.toLowerCase().trim(),
          imageUrl: item.imageUrl,
          sourceProvider: 'fixture',
          dataStatus: 'sample',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      productsCount++;

      // Upsert Offers by compound unique index: (provider, externalProductId)
      if (Array.isArray(item.offers)) {
        for (const offerItem of item.offers) {
          await Offer.findOneAndUpdate(
            {
              provider: offerItem.provider,
              externalProductId: offerItem.externalProductId,
            },
            {
              productId: product._id,
              provider: offerItem.provider,
              externalProductId: offerItem.externalProductId,
              title: offerItem.title.trim(),
              productUrl: offerItem.productUrl,
              priceInPaise: Math.round(offerItem.priceInPaise),
              currency: offerItem.currency || 'INR',
              availability: offerItem.availability || 'in_stock',
              isSample: true, // Master Guide rule: all fixture data is explicitly isSample: true
              dataStatus: 'sample',
              lastFetchedAt: new Date(),
              lastSuccessAt: offerItem.forceFail ? null : new Date(),
              lastStatus: offerItem.forceFail ? 'error' : 'ok',
              lastError: offerItem.forceFail ? 'Simulated provider error for testing' : null,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          offersCount++;
        }
      }
    }

    console.log(`✅ [seeder] Seeding complete:`);
    console.log(`   - Upserted ${productsCount} products`);
    console.log(`   - Upserted ${offersCount} offers`);
    return { productsCount, offersCount };
  } catch (err) {
    console.error('❌ [seeder] Seeding failed:', err.message);
    if (options.throwOnError) throw err;
    process.exit(1);
  } finally {
    if (connectedLocally && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('[seeder] Database connection closed.');
    }
  }
}

// Self-invoking execution when called directly from CLI
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  seedFixtures()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export default seedFixtures;
