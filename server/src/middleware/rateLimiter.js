// server/src/middleware/rateLimiter.js
// Lightweight in-memory rate limiter to protect sensitive endpoints from spam and brute force.

export function createRateLimiter({
  windowMs = 60000,
  max = 20,
  message = 'Too many requests, please try again later.',
} = {}) {
  const hits = new Map();

  return (req, res, next) => {
    // In test environment, allow bypassing if explicitly flagged or generous limit
    if (process.env.DISABLE_RATE_LIMIT === 'true') {
      return next();
    }

    const key = req.user?.id || req.ip || 'global';
    const now = Date.now();
    const timestamps = hits.get(key) || [];

    const windowStart = now - windowMs;
    const recent = timestamps.filter((t) => t > windowStart);

    if (recent.length >= max) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
        },
      });
    }

    recent.push(now);
    hits.set(key, recent);
    next();
  };
}
