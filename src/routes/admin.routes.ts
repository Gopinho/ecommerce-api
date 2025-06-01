import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';
import { getAdminStats } from '../controllers/admin.controller';

const router = Router();

/**
 * @openapi
 * /admin:
 *   get:
 *     summary: Área administrativa
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acesso à área administrativa
 */
router.get('/', authenticate, authorizeRole('ADMIN'), (req, res) => {
  res.json({ message: 'Área administrativa' });
});

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     summary: Estatísticas administrativas
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas administrativas obtidas com sucesso
 */
router.get('/stats', authenticate, authorizeRole('ADMIN'), getAdminStats);

export default router;
