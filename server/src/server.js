// server/src/server.js
import './config/env.js';
import app from './app.js';
import connectDB from './config/db.js';
import { startLinkListener, stopLinkListener } from './services/notifications/telegram.js';
import { startScheduler, stopScheduler } from './services/scheduler.js';

const PORT = process.env.PORT || 5000;

let dbRetryTimer = null;
let servicesStarted = false;

function startBackgroundServices() {
  if (servicesStarted) return;
  servicesStarted = true;

  if (process.env.NODE_ENV !== 'test' && process.env.TELEGRAM_BOT_TOKEN) {
    try {
      startLinkListener();
      console.log('[server] Telegram account linking listener started');
    } catch (err) {
      console.warn('[server] Failed to start Telegram listener:', err.message);
    }
  }

  if (process.env.NODE_ENV !== 'test') {
    try {
      startScheduler();
    } catch (err) {
      console.warn('[server] Failed to start price monitor scheduler:', err.message);
    }
  }
}

async function tryConnectDb() {
  try {
    await connectDB();
    console.log('[server] Database connected successfully.');
    if (dbRetryTimer) {
      clearInterval(dbRetryTimer);
      dbRetryTimer = null;
    }
    startBackgroundServices();
  } catch (err) {
    console.error('[server] Database connection warning:', err.message);
    console.error('👉 If accessing MongoDB Atlas, please verify that your hosting outbound IP ranges are authorized in Atlas Network Access.');
    if (!dbRetryTimer && process.env.NODE_ENV !== 'test') {
      console.log('[server] Retrying database connection every 10 seconds...');
      dbRetryTimer = setInterval(tryConnectDb, 10000);
    }
  }
}

async function start() {
  try {
    const server = app.listen(PORT, async () => {
      console.log(`[server] PriceRadar API listening on port ${PORT}`);
      // Attempt database connection without aborting server startup on initial failure
      await tryConnectDb();
    });

    const shutdown = () => {
      console.log('[server] Gracefully shutting down...');
      if (dbRetryTimer) clearInterval(dbRetryTimer);
      stopLinkListener();
      stopScheduler();
      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('[server] Failed to bind HTTP server:', err.message);
    process.exit(1);
  }
}

// Start HTTP server only when run directly
if (process.env.NODE_ENV !== 'test') {
  start();
}

export default app;
