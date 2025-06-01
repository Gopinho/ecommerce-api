import { Request, Response, NextFunction } from 'express';
import { convertCurrency } from '../services/currency.service';
import { z } from 'zod';

const convertQuerySchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)), { message: 'amount deve ser um número' }),
  from: z.string().min(1),
  to: z.string().min(1)
});

export async function convertPrice(req: Request, res: Response, next: NextFunction) {
  const parsed = convertQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return next({ message: 'currency.missing_params', status: 400, details: parsed.error.errors });
  }
  try {
    const { amount, from, to } = parsed.data;
    const result = await convertCurrency(Number(amount), from, to);
    res.json(result);
  } catch (err: any) {
    next(err);
  }
}