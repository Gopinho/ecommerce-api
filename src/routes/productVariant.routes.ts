import { Router } from 'express';
import { ProductVariantController } from '../controllers/productVariant.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

// Public routes - get variants info
router.get('/product/:productId/variants', ProductVariantController.getVariantsByProduct);
router.get('/product/:productId/sizes', ProductVariantController.getAvailableSizes);
router.get('/product/:productId/colors', ProductVariantController.getAvailableColors);
router.get('/product/:productId/stock', ProductVariantController.checkStock);
router.get('/:id', ProductVariantController.getVariant);

// Admin only routes - manage variants
router.post('/', authenticate, authorizeRole('ADMIN'), ProductVariantController.createVariant);
router.put('/:id', authenticate, authorizeRole('ADMIN'), ProductVariantController.updateVariant);
router.delete('/:id', authenticate, authorizeRole('ADMIN'), ProductVariantController.deleteVariant);

export default router;