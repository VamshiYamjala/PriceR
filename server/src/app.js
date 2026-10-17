// server/src/app.js
import './config/env.js';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import offerRoutes from './routes/offers.js';
import watchlistRoutes from './routes/watchlist.js';
import alertRoutes from './routes/alerts.js';
import notificationRoutes from './routes/notifications.js';
import notificationPreferencesRoutes from './routes/notificationPreferences.js';
import telegramRoutes from './routes/telegram.js';
import monitorRoutes from './routes/monitor.js';
import diagnosticsRoutes from './routes/diagnostics.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// CORS: parse CLIENT_ORIGIN (supports single URL, comma-separated URLs, or local fallback)
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Render health probes, server-to-server)
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Parses incoming JSON request bodies
app.use(express.json());

import mongoose from 'mongoose';

// Health check — no auth, used by Render and deployment health monitoring
// Returns HTTP 200 when database is connected, HTTP 503 when database is unavailable
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const statusCode = isConnected ? 200 : 503;
  return res.status(statusCode).json({
    status: isConnected ? 'ok' : 'unhealthy',
    database: isConnected ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

// Fast-fail middleware: if database is disconnected in non-test mode, return actionable 503 instead of 10-second timeout
app.use('/api', (req, res, next) => {
  if (req.path === '/health' || req.path.startsWith('/diagnostics')) return next();
  if (process.env.NODE_ENV !== 'test' && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_DISCONNECTED',
        message: 'Database is temporarily unreachable. If using MongoDB Atlas, please ensure your hosting environment outbound IP ranges are authorized in the Atlas Network Access list.',
      },
    });
  }
  next();
});

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notification-preferences', notificationPreferencesRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);

// 404 for anything that matched no route above
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found.' },
  });
});

// Centralized error handler — MUST be the last app.use() call
app.use(errorHandler);

export default app;
