// server/src/routes/offers.js
import { Router } from 'express';
import { getOfferHistory } from '../controllers/offersController.js';

const router = Router();

router.get('/:offerId/history', getOfferHistory);

export default router;
