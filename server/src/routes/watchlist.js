// server/src/routes/watchlist.js
import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  listWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from '../controllers/watchlistController.js';

const router = Router();

router.use(requireAuth);

router.get('/', listWatchlist);
router.post(
  '/',
  [body('offerId').notEmpty().withMessage('offerId is required.')],
  validate,
  addToWatchlist
);
router.delete('/:watchlistItemId', removeFromWatchlist);

export default router;
