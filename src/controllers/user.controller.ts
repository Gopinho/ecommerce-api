import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function exportUserData(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user.id;

    // Busca os dados principais do utilizador
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        licenses: true,
        orders: true,
        auditLogs: true,
        reviews: true,
        wishlist: true,
      },
    });

    if (!user) {
      throw { message: 'user.not_found', status: 404 };
    }

    if ('password' in user) {
      delete (user as any).password;
    }

    res.setHeader('Content-Disposition', 'attachment; filename="meu_dados.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(user, null, 2));
  } catch (err) {
    next(err);
  }
}