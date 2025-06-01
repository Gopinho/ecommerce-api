import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { z } from 'zod';

// Exemplo de validação de query params para estatísticas (podes expandir conforme necessário)
const statsQuerySchema = z.object({
  recentOrdersLimit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => !val || (Number.isInteger(val) && val > 0 && val <= 100), {
      message: 'recentOrdersLimit deve ser um número entre 1 e 100',
    }),
});

export async function getAdminStats(req: Request, res: Response, next: NextFunction) {
  try {
    // Validação dos query params
    const parsed = statsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return next({ message: 'admin.invalid_query', status: 400, details: parsed.error.errors });
    }
    const { recentOrdersLimit } = parsed.data;

    const totalSales = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true }
    });
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: recentOrdersLimit || 10,
      include: { user: true }
    });

    res.json({
      totalSales,
      totalRevenue: totalRevenue._sum?.total || 0,
      totalUsers,
      totalProducts,
      recentOrders
    });
  } catch (err) {
    next(err);
  }
}