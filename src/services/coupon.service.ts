import prisma from '../prisma/client';
import { decimalToNumber } from '../utils/decimal';

export async function createCoupon(data: {
    code: string;
    description?: string;
    discountType: 'percent' | 'fixed';
    amount: number;
    expiresAt: Date;
    maxUses?: number;
    minOrderValue?: number;
}) {
    return prisma.coupon.create({ data });
}

export async function getCoupon(code: string) {
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon) throw new Error('coupon.not_found');
    return coupon;
}

export async function validateCoupon(code: string, orderTotal: number) {
    const coupon = await getCoupon(code);

    if (coupon.expiresAt < new Date()) throw new Error('coupon.expired');
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
        throw new Error('coupon.limit_reached');
    if (coupon.minOrderValue && orderTotal < decimalToNumber(coupon.minOrderValue))
        throw new Error('coupon.min_order_value'); return coupon;
}

export async function incrementUsage(code: string) {
    await prisma.coupon.update({
        where: { code },
        data: { usedCount: { increment: 1 } },
    });
}
