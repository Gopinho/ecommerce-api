import { Request, Response } from 'express';
import { stripe } from '../lib/stripe';
import prisma from '../prisma/client';
import Stripe from 'stripe';

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    // Erro de assinatura ou payload inválido
    return res.status(400).send(`Webhook Error: ${(err as any).message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

      // Cria o pedido (Order)
      await prisma.order.create({
        data: {
          userId: userId!,
          total,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      });

      // Atualiza o stock dos produtos
      for (const item of cartItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Limpa o carrinho
      await prisma.cartItem.deleteMany({ where: { userId } });
    }

    res.status(200).json({ received: true });
  } catch (err) {
    // Erro interno ao processar o webhook
    return res.status(500).json({ error: 'webhook.processing_error', details: (err as any).message });
  }
}