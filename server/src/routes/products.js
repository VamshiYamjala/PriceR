// server/src/routes/products.js
import { Router } from 'express';
import {
  searchProducts,
  getProductById,
  getCategories,
  getProviderStatus,
} from '../controllers/productsController.js';

const router = Router();

// Static routes mounted BEFORE /:productId to prevent route collision
router.get('/categories', getCategories);
router.get('/providers/status', getProviderStatus);
router.get('/search', searchProducts);
router.get('/:productId', getProductById);

export default router;
