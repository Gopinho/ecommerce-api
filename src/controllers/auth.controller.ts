import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middlewares/authenticate';
import { z } from 'zod';

// Schemas de validação
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  token2FA: z.string().optional()
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
});

const emailSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8)
});

const changeEmailSchema = z.object({
  newEmail: z.string().email()
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: 'validation.error', status: 400, details: parsed.error.errors });
    }
    const { email, password, name } = parsed.data;
    const user = await authService.register(email, password, name);
    res.status(201).json({ ...user, message: req.__('auth.register_success') });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: 'validation.error', status: 400, details: parsed.error.errors });
    }
    const { email, password, token2FA } = parsed.data;
    const tokens = await authService.login(email, password, token2FA);
    res.json({ ...tokens, message: req.__('auth.login_success') });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: 'auth.token_required', status: 400, details: parsed.error.errors });
    }
    const { refreshToken } = parsed.data;
    const tokens = await authService.refresh(refreshToken);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function logoutUser(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: 'auth.token_required', status: 400, details: parsed.error.errors });
    }
    const { refreshToken } = parsed.data;
    await authService.logout(refreshToken);
    res.status(200).json({ message: req.__('auth.logout_success') });
  } catch (err) {
    next(err);
  }
}

export async function requestPasswordReset(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = emailSchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: 'validation.error', status: 400, details: parsed.error.errors });
    }
    const { email } = parsed.data;
    const result = await authService.requestPasswordReset(email);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: 'validation.error', status: 400, details: parsed.error.errors });
    }
    const { token, newPassword } = parsed.data;
    const result = await authService.resetPassword(token, newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw { message: 'auth.not_authenticated', status: 401 };

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) throw { message: 'auth.user_not_found', status: 404 };

    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function changeEmail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const parsed = changeEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: 'auth.new_email_required', status: 400, details: parsed.error.errors });
    }
    const userId = req.user?.id;
    const { newEmail } = parsed.data;

    const exists = await prisma.user.findUnique({ where: { email: newEmail } });
    if (exists) {
      throw { message: 'auth.email_in_use', status: 409 };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
      select: { id: true, email: true, name: true }
    });

    res.json({ message: req.__('auth.email_changed_success'), user });
  } catch (err) {
    next(err);
  }
}