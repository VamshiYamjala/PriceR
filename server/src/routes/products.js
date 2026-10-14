// server/src/routes/products.js
import { Router } from 'express';
import { searchProducts, getProductById } from '../controllers/productsController.js';

const router = Router();

router.get('/search', searchProducts);
router.get('/:productId', getProductById);

export default router;
