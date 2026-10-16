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

let listenersAttached = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Copy server/.env.example to server/.env and fill in a real Atlas connection string.'
    );
  }

  if (!listenersAttached) {
    listenersAttached = true;
    mongoose.connection.on('connected', () => {
      console.log('[db] Mongoose connected to MongoDB Atlas');
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

export default connectDB;
