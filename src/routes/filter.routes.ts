import { Router } from 'express';
import { FilterController } from '../controllers/filter.controller';

const router = Router();

// All filter routes are public for browsing products
router.get('/options', FilterController.getFilterOptions);
router.get('/products', FilterController.filterProducts);
router.get('/counts', FilterController.getFilterCounts);
router.get('/search', FilterController.searchProducts);

export default router;