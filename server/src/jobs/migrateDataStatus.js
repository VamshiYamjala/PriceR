// server/src/jobs/migrateDataStatus.js
// Safe, idempotent database migration script (Document prompt Section 10).
// Ensures all existing fixture products and offers have dataStatus: "sample" and sourceProvider: "fixture".
// Non-destructive: preserves users, watchlists, alerts, notification history, and price observations.

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Offer from '../models/Offer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export async function migrateDataStatus() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not configured in server/.env');
    process.exit(1);
  }

  let connectedLocally = false;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
    connectedLocally = true;
    console.log('[migration] Connected to MongoDB Atlas');
  }

  try {
    // 1. Update Products lacking dataStatus
    const productResult = await Product.updateMany(
      { $or: [{ dataStatus: { $exists: false } }, { dataStatus: null }] },
      { $set: { dataStatus: 'sample', sourceProvider: 'fixture' } }
    );
    console.log(`[migration] Updated ${productResult.modifiedCount} products to dataStatus: "sample"`);

    // 2. Update Offers lacking dataStatus
    const offerResult = await Offer.updateMany(
      { $or: [{ dataStatus: { $exists: false } }, { dataStatus: null }] },
      { $set: { dataStatus: 'sample', isSample: true } }
    );
    console.log(`[migration] Updated ${offerResult.modifiedCount} offers to dataStatus: "sample"`);

    return {
      productsModified: productResult.modifiedCount,
      offersModified: offerResult.modifiedCount,
    };
  } catch (err) {
    console.error('[migration] Migration error:', err.message);
    throw err;
  } finally {
    if (connectedLocally && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('[migration] Database connection closed.');
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  migrateDataStatus()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export default migrateDataStatus;
