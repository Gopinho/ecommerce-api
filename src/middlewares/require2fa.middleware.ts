import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import speakeasy from 'speakeasy';

export async function require2FA(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: req.__('auth.not_authenticated') });

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user?.twoFactorEnabled) {
    const token = req.headers['x-2fa-token'] as string;

    if (!token) return res.status(401).json({ error: req.__('auth.2fa_required') });

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!isValid) return res.status(401).json({ error: req.__('auth.invalid_2fa_token') });
  }

  next();
}
