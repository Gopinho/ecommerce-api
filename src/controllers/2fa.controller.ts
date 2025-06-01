import { Response, NextFunction } from 'express';
import * as twoFAService from '../services/2fa.service';
import { AuthenticatedRequest } from '../middlewares/authenticate';
import { z } from 'zod';

const tokenSchema = z.object({
  token: z.string().min(4, '2fa.token_required')
});

export async function setup2FA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw { message: 'auth.not_authenticated', status: 401 };
    }
    const userId = req.user.id;
    const result = await twoFAService.generate2FA(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function confirm2FA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw { message: 'auth.not_authenticated', status: 401 };
    }

    const parsed = tokenSchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: '2fa.token_required', status: 400, details: parsed.error.errors });
    }

    const userId = req.user.id;
    const { token } = parsed.data;

    const isValid = await twoFAService.verify2FA(userId, token);
    if (!isValid) {
      throw { message: '2fa.invalid_code', status: 400 };
    }

    res.json({ message: req.__('2fa.activated') });
  } catch (err) {
    next(err);
  }
}

export async function disable2FA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw { message: 'auth.not_authenticated', status: 401 };
    }

    const parsed = tokenSchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: '2fa.token_required', status: 400, details: parsed.error.errors });
    }

    const userId = req.user.id;
    const { token } = parsed.data;

    const success = await twoFAService.disable2FA(userId, token);
    if (success) {
      res.json({ message: req.__('2fa.deactivated') });
    } else {
      throw { message: '2fa.invalid_code', status: 400 };
    }
  } catch (err) {
    next(err);
  }
}