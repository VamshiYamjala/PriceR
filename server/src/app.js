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
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// CORS: only the configured frontend origin may call this API
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  })
);

// Parses incoming JSON request bodies
app.use(express.json());

import mongoose from 'mongoose';

// Health check — no auth, used by deployment checks and the team itself
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

// Fast-fail middleware: if database is disconnected in non-test mode, return actionable 503 instead of 10-second timeout
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (process.env.NODE_ENV !== 'test' && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_DISCONNECTED',
        message: 'Database is temporarily unreachable. If using MongoDB Atlas, please ensure your current IP address (103.88.236.42) is added to the Atlas IP Access List.',
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
