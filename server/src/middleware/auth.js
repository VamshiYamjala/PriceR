// server/src/middleware/auth.js
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_REQUIRED', message: 'Authentication is required for this route.' },
    });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub };
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_INVALID',
        message: 'Your session is invalid or has expired. Please log in again.',
      },
    });
  }
}

export default requireAuth;
