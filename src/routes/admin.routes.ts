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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Área administrativa
 */
router.get(
  '/',
  authenticate,
  authorizeRole('ADMIN'),
  (req, res) => {
    res.json({ message: 'Área administrativa' });
  }
);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSales:
 *                   type: integer
 *                   example: 120
 *                 totalRevenue:
 *                   type: number
 *                   example: 15000.50
 *                 totalUsers:
 *                   type: integer
 *                   example: 300
 *                 totalProducts:
 *                   type: integer
 *                   example: 50
 *                 recentOrders:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get(
  '/stats',
  authenticate,
  authorizeRole('ADMIN'),
  getAdminStats
);

export default router;