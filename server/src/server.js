// server/src/server.js
import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[server] PriceRadar API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  }
}

// Start HTTP server only when run directly
if (process.env.NODE_ENV !== 'test') {
  start();
}

export default app;
