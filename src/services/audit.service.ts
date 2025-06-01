import prisma from '../prisma/client';

export async function logAction(userId: string, action: string, entity: string, entityId: string) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
    },
  });
}

export async function getUserAuditLogs(userId: string) {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 100, // Limite opcional
  });
}