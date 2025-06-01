import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export function authorizePermission(permission: string) {
  return async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'auth.not_authenticated' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: true,
        group: { include: { users: { include: { permissions: true } } } }
      }
    });

    // Permissões diretas do utilizador
    const userPerms = user?.permissions.map(p => p.name) || [];

    // Permissões herdadas do grupo (se quiseres implementar permissões por grupo)
    // Exemplo: todos os users do grupo têm as permissões do grupo
    // (mas no teu schema atual, UserGroup não tem permissões, só users)
    // Se quiseres permissões por grupo, tens de adicionar isso ao modelo!

    if (userPerms.includes(permission)) {
      return next();
    }
    return res.status(403).json({ error: 'common.forbidden' });
  };
}