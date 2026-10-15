import { Router } from 'express';
import { getOfferHistory, getOfferById } from '../controllers/offersController.js';

const router = Router();

router.get('/:offerId', getOfferById);
router.get('/:offerId/history', getOfferHistory);

export default router;
