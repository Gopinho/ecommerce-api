import { Request, Response } from 'express';
import * as couponService from '../services/coupon.service';
import { z } from 'zod';

// Validação com Zod
const couponSchema = z.object({
  code: z.string().min(3),
  amount: z.number().positive(),
  discountType: z.enum(['percent', 'fixed']),
  expiresAt: z.string().datetime().optional(),
  usageLimit: z.number().int().positive().optional()
});

export async function createCoupon(req: Request, res: Response) {
  try {
    const parsed = couponSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'coupon.invalid_data', details: parsed.error.errors });
    }

    const { code, amount, discountType, expiresAt, usageLimit } = parsed.data;
    const data: any = { code, amount, discountType };

    if (expiresAt) data.expiresAt = new Date(expiresAt);
    if (usageLimit) data.maxUses = usageLimit;

    const coupon = await couponService.createCoupon(data);
    res.status(201).json(coupon);
  } catch (err: any) {
    res.status(400).json({ error: req.__(err.message) || err.message });
  }
}

export async function getCouponByCode(req: Request, res: Response) {
  try {
    const { code } = req.params;
    const coupon = await couponService.getCoupon(code);
    res.json(coupon);
  } catch (err: any) {
    res.status(404).json({ error: req.__(err.message) || err.message });
  }
}