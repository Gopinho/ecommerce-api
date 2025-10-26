import { Router } from 'express';
import { ProductImageController } from '../controllers/productImage.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';
import { uploadSingleImage, uploadMultipleImages } from '../middlewares/imageUpload.middleware';

const router = Router();

// Public routes - get images
router.get('/product/:productId', ProductImageController.getImagesByProduct);

// Admin only routes - manage images
router.post('/upload', authenticate, authorizeRole('ADMIN'), uploadSingleImage, ProductImageController.uploadImage);
router.post('/upload-multiple', authenticate, authorizeRole('ADMIN'), uploadMultipleImages, ProductImageController.uploadMultipleImages);
router.post('/', authenticate, authorizeRole('ADMIN'), ProductImageController.createImage);
router.put('/:id', authenticate, authorizeRole('ADMIN'), ProductImageController.updateImage);
router.put('/:id/main', authenticate, authorizeRole('ADMIN'), ProductImageController.setMainImage);
router.put('/reorder/:productId', authenticate, authorizeRole('ADMIN'), ProductImageController.reorderImages);
router.delete('/:id', authenticate, authorizeRole('ADMIN'), ProductImageController.deleteImage);

export default router;