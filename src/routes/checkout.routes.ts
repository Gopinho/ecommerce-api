import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
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
 *               couponCode:
 *                 type: string
 *                 example: "DESCONTO10"
 *     responses:
 *       200:
 *         description: Sessão Stripe criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "https://checkout.stripe.com/pay/cs_test_..."
 *       400:
 *         description: Dados inválidos ou carrinho vazio
 *       401:
 *         description: Não autenticado
 */
router.post('/stripe', createStripeSession);

export default router;