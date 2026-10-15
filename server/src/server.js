// server/src/server.js
import './config/env.js';
import app from './app.js';
import connectDB from './config/db.js';
import { startLinkListener, stopLinkListener } from './services/notifications/telegram.js';
import { startScheduler, stopScheduler } from './services/scheduler.js';

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[server] PriceRadar API listening on port ${PORT}`);

      // Start Telegram long-polling listener for local development
      if (process.env.NODE_ENV !== 'test' && process.env.TELEGRAM_BOT_TOKEN) {
        startLinkListener();
        console.log('[server] Telegram account linking listener started');
      }

      // Start in-process 4-hour periodic price refresh scheduler
      if (process.env.NODE_ENV !== 'test') {
        startScheduler();
      }
    });

    const shutdown = () => {
      console.log('[server] Gracefully shutting down...');
      stopLinkListener();
      stopScheduler();
      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
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
