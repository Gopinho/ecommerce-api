import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { getUserAuditLogs } from '../services/audit.service';
import { z } from 'zod';

const userIdParamSchema = z.object({
  userId: z.string().min(1)
});

export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

export async function userAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw { message: 'auth.not_authenticated', status: 401 };
    }
    const userId = req.user.id;
    const logs = await getUserAuditLogs(userId);
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

export async function userAuditLogsByAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = userIdParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return next({ message: 'user.invalid_id', status: 400, details: parsed.error.errors });
    }
    const { userId } = parsed.data;
    const logs = await getUserAuditLogs(userId);
    res.json(logs);
  } catch (err) {
    next(err);
  }
}