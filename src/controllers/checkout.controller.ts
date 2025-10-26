import { Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { stripe } from '../lib/stripe';
import { AuthenticatedRequest } from '../middlewares/authenticate';
import { validateCoupon, incrementUsage } from '../services/coupon.service';
import { decimalToNumber, multiplyDecimals } from '../utils/decimal';
import { z } from 'zod';

// Validação do corpo do pedido
const checkoutSchema = z.object({
    couponCode: z.string().optional()
});

export async function createStripeSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw { message: 'auth.not_authenticated', status: 401 };
        }

        const parsed = checkoutSchema.safeParse(req.body);
        if (!parsed.success) {
            return next({ message: 'checkout.invalid_data', status: 400, details: parsed.error.errors });
        }
        const { couponCode } = parsed.data;

        const cartItems = await prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
        });

        if (!cartItems.length) {
            throw { message: 'checkout.empty_cart', status: 400 };
        }

        // Calcular total do carrinho
        let orderTotal = cartItems.reduce((sum, item) => {
            return sum + multiplyDecimals(item.product.price, item.quantity);
        }, 0);
        let discount = 0;

        // Aplica cupão se existir
        if (couponCode) {
            const coupon = await validateCoupon(couponCode, orderTotal);
            if (coupon.discountType === 'percent') {
                discount = orderTotal * (decimalToNumber(coupon.amount) / 100);
            } else {
                discount = decimalToNumber(coupon.amount);
            }
            orderTotal -= discount;
            await incrementUsage(coupon.code);
        } const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: cartItems.map((item) => ({
                quantity: item.quantity,
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.product.name,
                        description: item.product.description,
                    },
                    unit_amount: Math.round(decimalToNumber(item.product.price) * 100),
                },
            })),
            discounts: couponCode ? [{ coupon: couponCode }] : undefined,
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
            metadata: {
                userId,
                couponCode: couponCode || '',
                discount: discount.toString(),
                orderTotal: orderTotal.toString(),
            },
        });

        res.json({ url: session.url });
    } catch (err) {
        next(err);
    }
}