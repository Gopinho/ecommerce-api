import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export async function getAdminStats(req: Request, res: Response, next: NextFunction) {
  try {
    const totalSales = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
        _sum: { total: true }
    });
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const recentOrders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
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