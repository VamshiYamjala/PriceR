// server/src/middleware/validate.js
import { validationResult } from 'express-validator';

export function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const firstError = result.array()[0];
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: firstError.msg,
      },
    });
  }
  return next();
}

export default validate;
