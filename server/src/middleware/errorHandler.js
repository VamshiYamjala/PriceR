// server/src/middleware/errorHandler.js

export function errorHandler(err, req, res, next) {
  console.error('[error]', err);

  // Mongoose validation errors get a clear, specific message instead of a
  // generic 500 — these are effectively a late-caught validation problem
  // (e.g. a direct .save() call that bypassed express-validator).
  if (err.name === 'ValidationError') {
    const firstMessage = Object.values(err.errors)[0]?.message || 'Validation failed.';
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: firstMessage },
    });
  }

  // Malformed ObjectId passed in a route param (e.g. /api/alerts/not-a-real-id).
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: `Invalid id: ${err.value}` },
    });
  }

  // MongoDB duplicate-key error not already caught closer to the source.
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: 'This record already exists.' },
    });
  }

  const status = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  return res.status(status).json({
    success: false,
    error: {
      code: err.code && typeof err.code === 'string' ? err.code : 'SERVER_ERROR',
      // Never leak internals (stack trace, file paths) to the client in
      // production — Document 1 Section 8.
      message:
        isProduction && status === 500
          ? 'Something went wrong. Please try again.'
          : err.message || 'Internal server error.',
    },
  });
}

export default errorHandler;
