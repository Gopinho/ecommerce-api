import { Router } from 'express';
import { createCoupon, getCouponByCode } from '../controllers/coupon.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

/**
 * @openapi
 * /coupons:
 *   post:
 *     summary: Criar novo cupom
 *     tags:
 *       - Coupons
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "DESCONTO10"
 *               amount:
 *                 type: number
 *                 example: 10
 *               discountType:
 *                 type: string
 *                 enum: [percent, fixed]
 *                 example: "percent"
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-31T23:59:59Z"
 *               usageLimit:
 *                 type: integer
 *                 example: 100
 *     responses:
 *       201:
 *         description: Cupom criado com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post('/', authMiddleware, authorizeRole('ADMIN'), createCoupon);

/**
 * @openapi
 * /coupons/{code}:
 *   get:
 *     summary: Obter cupom por código
 *     tags:
 *       - Coupons
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Código do cupom
 *     responses:
 *       200:
 *         description: Cupom encontrado com sucesso
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Cupom não encontrado
 */
router.get('/:code', authMiddleware, getCouponByCode);

export default router;