// server/src/routes/auth.js
import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  initiateRegistration,
  verifyRegistration,
  resendRegistrationOtp,
  login,
  getMe,
} from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Registration OTP flow
router.post(
  '/register/initiate',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  ],
  validate,
  initiateRegistration
);

router.post(
  '/register/verify',
  [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be a 6-digit code.'),
  ],
  validate,
  verifyRegistration
);

router.post(
  '/register/resend',
  [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
  ],
  validate,
  resendRegistrationOtp
);

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  login
);

router.get('/me', requireAuth, getMe);

export default router;
