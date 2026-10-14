import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Copy server/.env.example to server/.env and fill in a real Atlas connection string.'
    );
  }

  mongoose.connection.on('connected', () => {
    console.log('[db] Mongoose connected to MongoDB Atlas');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[db] Mongoose connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] Mongoose disconnected from MongoDB');
  });

  await mongoose.connect(uri);
}

export default connectDB;
