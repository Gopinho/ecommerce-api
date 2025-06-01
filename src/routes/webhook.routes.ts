import { Router } from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller';
import bodyParser from 'body-parser';

const router = Router();

/**
 * @openapi
 * /webhook/stripe:
 *   post:
 *     summary: Webhook Stripe (apenas para uso do Stripe)
 *     tags:
 *       - Webhook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook recebido com sucesso
 *       400:
 *         description: Erro de assinatura ou payload inválido
 *       500:
 *         description: Erro interno ao processar o webhook
 */
router.post(
  '/stripe',
  bodyParser.raw({ type: 'application/json' }),
  handleStripeWebhook
);

export default router;