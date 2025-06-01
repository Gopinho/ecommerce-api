import { Request, Response, NextFunction } from 'express';
import { convertCurrency } from '../services/currency.service';

export async function convertPrice(req: Request, res: Response, next: NextFunction) {
  const { amount, from, to } = req.query;
  if (!amount || !from || !to) {
    // Usa o middleware global de erro
    return next({ message: 'currency.missing_params', status: 400 });
  }
  try {
    const result = await convertCurrency(Number(amount), String(from), String(to));
    res.json(result);
  } catch (err: any) {
    // Passa o erro para o middleware global
    next(err);
  }
}