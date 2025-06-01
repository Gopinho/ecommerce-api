import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas
  message: (req: Request, res: Response) => ({
    error: req.__('auth.too_many_attempts'),
  }),
  standardHeaders: true,
  legacyHeaders: false,
});
