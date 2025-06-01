import { Router } from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller';
import bodyParser from 'body-parser';

const router = Router();

// raw body (necessário para verificação do Stripe)

router.post(
  '/stripe',
  bodyParser.raw({ type: 'application/json' }),
  handleStripeWebhook
);

export default router;
