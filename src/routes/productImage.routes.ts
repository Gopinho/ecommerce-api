import { Router } from 'express';
import { ProductImageController } from '../controllers/productImage.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

// Public routes - get images
router.get('/product/:productId', ProductImageController.getImagesByProduct);

// Admin only routes - manage images
router.post('/', authenticate, authorizeRole('ADMIN'), ProductImageController.createImage);
router.put('/:id', authenticate, authorizeRole('ADMIN'), ProductImageController.updateImage);
router.put('/:id/main', authenticate, authorizeRole('ADMIN'), ProductImageController.setMainImage);
router.delete('/:id', authenticate, authorizeRole('ADMIN'), ProductImageController.deleteImage);

export default router;