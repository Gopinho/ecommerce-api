import { Request, Response } from 'express';
import { z } from 'zod';
import * as analyticsService from '../services/analytics.service';

// Schemas de validação
const paginationSchema = z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
    status: z.string().optional()
});

const userPaginationSchema = z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
    role: z.string().optional()
});

/**
 * STATS BÁSICOS - Endpoint simples para compatibilidade
 * GET /dashboard/stats
 */
export async function getStats(req: Request, res: Response) {
    try {
        const [dashboardMetrics, orderMetrics] = await Promise.all([
            analyticsService.getDashboardMetrics(),
            analyticsService.getOrderMetrics()
        ]);

        // Contar produtos e pedidos pendentes diretamente
        const [totalProducts, pendingOrders] = await Promise.all([
            analyticsService.getTotalProducts(),
            analyticsService.getPendingOrders()
        ]);

        res.status(200).json({
            success: true,
            data: {
                total_users: dashboardMetrics.totalClients,
                total_products: totalProducts,
                total_sales: dashboardMetrics.monthlySales,
                pending_orders: pendingOrders,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('Erro ao obter stats básicos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * FINANÇAS - Métricas principais
 * GET /dashboard/finance/metrics
 */
export async function getFinanceMetrics(req: Request, res: Response) {
    try {
        const [salesMetrics, financeMetrics] = await Promise.all([
            analyticsService.getSalesMetrics(),
            analyticsService.getFinanceMetrics()
        ]);

        res.status(200).json({
            success: true,
            data: {
                sales: salesMetrics,
                finance: financeMetrics,
                summary: {
                    totalSold: salesMetrics.totalSold,
                    monthlyGrowth: salesMetrics.monthlyGrowth,
                    totalProfit: salesMetrics.totalProfit,
                    totalRevenue: financeMetrics.totalRevenue,
                    totalExpenses: financeMetrics.totalExpenses,
                    netProfit: financeMetrics.totalRevenue - financeMetrics.totalExpenses
                }
            }
        });

    } catch (error: any) {
        console.error('Erro ao obter métricas financeiras:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * FINANÇAS - Encomendas a fornecedores
 * GET /dashboard/finance/supplier-orders
 */
export async function getSupplierOrdersOverview(req: Request, res: Response) {
    try {
        const financeMetrics = await analyticsService.getFinanceMetrics();

        res.status(200).json({
            success: true,
            data: {
                totalOrders: financeMetrics.totalSupplierOrders,
                totalValue: financeMetrics.supplierOrdersValue,
                averageOrderValue: financeMetrics.totalSupplierOrders > 0
                    ? Math.round((financeMetrics.supplierOrdersValue / financeMetrics.totalSupplierOrders) * 100) / 100
                    : 0
            }
        });

    } catch (error: any) {
        console.error('Erro ao obter overview de encomendas de fornecedores:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * DASHBOARD - Métricas principais
 * GET /dashboard/overview/metrics
 */
export async function getDashboardOverview(req: Request, res: Response) {
    try {
        const dashboardMetrics = await analyticsService.getDashboardMetrics();

        res.status(200).json({
            success: true,
            data: {
                totalClients: dashboardMetrics.totalClients,
                totalCompletedOrders: dashboardMetrics.totalCompletedOrders,
                monthlySales: dashboardMetrics.monthlySales
            }
        });

    } catch (error: any) {
        console.error('Erro ao obter métricas do dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * DASHBOARD - Estatísticas de vendas por mês
 * GET /dashboard/overview/monthly-sales
 */
export async function getMonthlySalesChart(req: Request, res: Response) {
    try {
        const monthlySalesData = await analyticsService.getMonthlySalesData();

        res.status(200).json({
            success: true,
            data: {
                chartData: monthlySalesData,
                summary: {
                    totalMonths: monthlySalesData.length,
                    totalSales: monthlySalesData.reduce((sum, month) => sum + month.sales, 0),
                    totalOrders: monthlySalesData.reduce((sum, month) => sum + month.orders, 0),
                    averageMonthlySales: monthlySalesData.length > 0
                        ? Math.round((monthlySalesData.reduce((sum, month) => sum + month.sales, 0) / monthlySalesData.length) * 100) / 100
                        : 0
                }
            }
        });

    } catch (error: any) {
        console.error('Erro ao obter dados de vendas mensais:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * DASHBOARD - Últimas 5 encomendas mais recentes
 * GET /dashboard/overview/recent-orders
 */
export async function getRecentOrders(req: Request, res: Response) {
    try {
        const recentOrders = await analyticsService.getRecentOrders();

        res.status(200).json({
            success: true,
            data: {
                orders: recentOrders,
                count: recentOrders.length
            }
        });

    } catch (error: any) {
        console.error('Erro ao obter encomendas recentes:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * ENCOMENDAS - Métricas
 * GET /dashboard/orders/metrics
 */
export async function getOrderMetrics(req: Request, res: Response) {
    try {
        const orderMetrics = await analyticsService.getOrderMetrics();

        res.status(200).json({
            success: true,
            data: {
                pendingOrders: orderMetrics.pendingOrders,
                completedOrders: orderMetrics.completedOrders,
                totalProfit: orderMetrics.totalProfit,
                conversionRate: orderMetrics.pendingOrders + orderMetrics.completedOrders > 0
                    ? Math.round((orderMetrics.completedOrders / (orderMetrics.pendingOrders + orderMetrics.completedOrders)) * 100 * 100) / 100
                    : 0
            }
        });

    } catch (error: any) {
        console.error('Erro ao obter métricas de encomendas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * ENCOMENDAS - Lista completa
 * GET /dashboard/orders/list
 */
export async function getAllOrders(req: Request, res: Response) {
    try {
        const { page, limit, status } = paginationSchema.parse(req.query);

        const ordersData = await analyticsService.getAllOrders(page, limit, status);

        res.status(200).json({
            success: true,
            data: ordersData
        });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Parâmetros inválidos',
                errors: error.errors
            });
        }

        console.error('Erro ao obter lista de encomendas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * UTILIZADORES - Lista completa
 * GET /dashboard/users/list
 */
export async function getAllUsers(req: Request, res: Response) {
    try {
        const { page, limit, role } = userPaginationSchema.parse(req.query);

        const usersData = await analyticsService.getAllUsersDetailed(page, limit, role);

        res.status(200).json({
            success: true,
            data: usersData
        });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Parâmetros inválidos',
                errors: error.errors
            });
        }

        console.error('Erro ao obter lista de utilizadores:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * GERAL - Todas as métricas em um só endpoint
 * GET /dashboard/all-metrics
 */
export async function getAllMetrics(req: Request, res: Response) {
    try {
        const [
            salesMetrics,
            financeMetrics,
            dashboardMetrics,
            orderMetrics,
            monthlySalesData,
            recentOrders
        ] = await Promise.all([
            analyticsService.getSalesMetrics(),
            analyticsService.getFinanceMetrics(),
            analyticsService.getDashboardMetrics(),
            analyticsService.getOrderMetrics(),
            analyticsService.getMonthlySalesData(),
            analyticsService.getRecentOrders()
        ]);

        res.status(200).json({
            success: true,
            data: {
                finance: {
                    metrics: salesMetrics,
                    revenue: financeMetrics,
                    netProfit: financeMetrics.totalRevenue - financeMetrics.totalExpenses
                },
                dashboard: {
                    metrics: dashboardMetrics,
                    monthlySales: monthlySalesData,
                    recentOrders: recentOrders
                },
                orders: {
                    metrics: orderMetrics
                },
                summary: {
                    totalRevenue: financeMetrics.totalRevenue,
                    totalProfit: salesMetrics.totalProfit,
                    totalClients: dashboardMetrics.totalClients,
                    totalOrders: dashboardMetrics.totalCompletedOrders,
                    monthlyGrowth: salesMetrics.monthlyGrowth
                }
            }
        });

    } catch (error: any) {
        console.error('Erro ao obter todas as métricas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}