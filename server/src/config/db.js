import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure server/.env is loaded if not already populated
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

// In test environments, ensure tests use an isolated test database
const isTestEnv = process.env.NODE_ENV === 'test' || Boolean(process.env.JEST_WORKER_ID);
if (isTestEnv) {
  if (process.env.TEST_MONGODB_URI) {
    process.env.MONGODB_URI = process.env.TEST_MONGODB_URI;
  } else if (
    !process.env.MONGODB_URI ||
    (!process.env.MONGODB_URI.includes('127.0.0.1') &&
      !process.env.MONGODB_URI.includes('localhost') &&
      !process.env.MONGODB_URI.includes('_test'))
  ) {
    // Default to isolated local test database matching CI service container
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/priceradar_test';
  }
}

let listenersAttached = false;

export async function connectDB(customUri) {
  const uri = customUri || process.env.TEST_MONGODB_URI || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Copy server/.env.example to server/.env and fill in a real Atlas connection string.'
    );
  }

  // Fail-fast guard against running automated test suites against remote production Atlas or non-test database
  let dbName = '';
  try {
    const parsed = new URL(uri.replace(/^mongodb(\+srv)?:\/\//, 'http://'));
    dbName = (parsed.pathname || '').replace(/^\//, '').split('?')[0];
  } catch {
    const match = uri.match(/\/([^/?]+)(\?|$)/);
    if (match) dbName = match[1];
  }

  const isRemote = uri.includes('.mongodb.net');
  const isLocalOrTestDb =
    uri.includes('127.0.0.1') ||
    uri.includes('localhost') ||
    (dbName && dbName.toLowerCase().includes('test'));

  if (isTestEnv && (isRemote || !isLocalOrTestDb) && !process.env.ALLOW_ATLAS_TESTS) {
    throw new Error(
      `Test execution blocked: Automated tests cannot run against non-test or remote database "${dbName || 'unspecified'}". Please configure an isolated test database (e.g. mongodb://127.0.0.1:27017/priceradar_test via TEST_MONGODB_URI or MONGODB_URI).`
    );
  }

  if (!listenersAttached) {
    listenersAttached = true;
    mongoose.connection.on('connected', () => {
      console.log(`[db] Mongoose connected to ${isRemote ? 'MongoDB Atlas' : 'isolated test MongoDB instance'}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('[db] Mongoose connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[db] Mongoose disconnected from MongoDB');
    });
  }

  await mongoose.connect(uri);
}

/**
 * Cleanly disconnects all Mongoose connections and internal topology monitors.
 */
export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export default connectDB;
