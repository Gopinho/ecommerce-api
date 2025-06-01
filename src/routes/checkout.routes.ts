import { Router } from 'express';
//import { checkout, listOrders } from '../controllers/checkout.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';
import { createStripeSession } from '../controllers/checkout.controller';

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * /checkout/stripe:
 *   post:
 *     summary: Criar sessão Stripe
 *     tags:
 *       - Checkout
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Sessão Stripe criada com sucesso
 *       401:
 *         description: Não autenticado
 */
router.post('/stripe', createStripeSession);
//router.get('/orders', authenticate, authorizeRole('ADMIN'), listOrders);

export default router;
