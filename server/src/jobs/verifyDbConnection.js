// server/src/jobs/verifyDbConnection.js
// Safe database verification script — tests MongoDB Atlas connection and pings the database.
// NEVER logs passwords or connection strings.

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function verify() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('PASTE_YOUR_DATABASE_PASSWORD_HERE')) {
    console.error('❌ [db] MONGODB_URI still contains the placeholder PASTE_YOUR_DATABASE_PASSWORD_HERE.');
    console.error('👉 Please edit server/.env and replace the placeholder with your actual database user password.');
    process.exit(1);
  }

  // Parse safe display info without exposing credentials
  try {
    const parsed = new URL(uri);
    const host = parsed.host;
    const dbName = parsed.pathname.replace(/^\//, '') || 'test';
    const user = parsed.username;
    console.log(`[db] Attempting connection to host: ${host} (User: ${user}, DB: ${dbName})...`);
  } catch (err) {
    console.log('[db] Attempting connection to MongoDB Atlas...');
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ [db] Mongoose connection established successfully!');

    // Ping the admin database to verify active network read/write capability
    await mongoose.connection.db.admin().ping();
    console.log('✅ [db] Database ping successful! Cluster is reachable and authenticated.');

    await mongoose.connection.close();
    console.log('[db] Connection closed cleanly.');
    process.exit(0);
  } catch (err) {
    console.error('❌ [db] Connection failed:', err.message);
    if (err.message.includes('authentication failed')) {
      console.error('💡 Hint: Check your database user password in server/.env. If your password has special characters like @, #, or %, make sure they are URL-encoded.');
    } else if (err.message.includes('querySrv') || err.message.includes('ENOTFOUND')) {
      console.error('💡 Hint: Check cluster hostname or DNS connectivity.');
    } else if (err.message.includes('whitelist') || err.message.includes('not allowed')) {
      console.error('💡 Hint: Check Network Access in MongoDB Atlas. Ensure 0.0.0.0/0 is added to IP Access List.');
    }
    process.exit(1);
  }
}

verify();
