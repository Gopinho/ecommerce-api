import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { getUserAuditLogs } from '../services/audit.service';

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
    const { userId } = req.params;
    if (!userId) {
      throw { message: 'user.not_found', status: 404 };
    }
    const logs = await getUserAuditLogs(userId);
    res.json(logs);
  } catch (err) {
    next(err);
  }
}