import { Router } from 'express';
import { SizeGuideController } from '../controllers/sizeGuide.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

// Public routes - get size guides
router.get('/', SizeGuideController.getSizeGuides);
router.get('/:id', SizeGuideController.getSizeGuide);
router.get('/category/:categoryId', SizeGuideController.getSizeGuideByCategory);
router.get('/recommendation/:categoryId', SizeGuideController.getSizeRecommendation);

// Admin only routes - manage size guides
router.post('/', authenticate, authorizeRole('ADMIN'), SizeGuideController.createSizeGuide);
router.put('/:id', authenticate, authorizeRole('ADMIN'), SizeGuideController.updateSizeGuide);
router.delete('/:id', authenticate, authorizeRole('ADMIN'), SizeGuideController.deleteSizeGuide);

export default router;