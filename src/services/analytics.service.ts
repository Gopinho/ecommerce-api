import prisma from '../prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Interfaces para tipagem
export interface SalesMetrics {
    totalSold: number;
    monthlyGrowth: number;
    totalProfit: number;
}

export interface FinanceMetrics {
    totalRevenue: number;
    totalExpenses: number;
    totalSupplierOrders: number;
    supplierOrdersValue: number;
}

export interface DashboardMetrics {
    totalClients: number;
    totalCompletedOrders: number;
    monthlySales: number;
}

export interface MonthlySalesData {
    month: string;
    year: number;
    sales: number;
    revenue: number;
    orders: number;
}

export interface OrderMetrics {
    pendingOrders: number;
    completedOrders: number;
    totalProfit: number;
}

export interface RecentOrder {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: number;
    status: string;
    createdAt: Date;
}

/**
 * FINANÇAS - Métricas principais
 */
export async function getSalesMetrics(): Promise<SalesMetrics> {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total vendido (todos os tempos)
    const totalSoldResult = await prisma.order.aggregate({
        where: {
            status: 'PAID'
        },
        _sum: {
            total: true
        }
    });

    // Vendas do mês atual
    const currentMonthSales = await prisma.order.aggregate({
        where: {
            status: 'PAID',
            createdAt: {
                gte: currentMonth
            }
        },
        _sum: {
            total: true
        }
    });

    // Vendas do mês anterior
    const previousMonthSales = await prisma.order.aggregate({
        where: {
            status: 'PAID',
            createdAt: {
                gte: previousMonth,
                lte: previousMonthEnd
            }
        },
        _sum: {
            total: true
        }
    });

    // Calcular crescimento mensal
    const currentTotal = Number(currentMonthSales._sum.total || 0);
    const previousTotal = Number(previousMonthSales._sum.total || 0);
    const monthlyGrowth = previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    // Profit total (assumindo uma margem de 30% sobre as vendas)
    const totalProfit = Number(totalSoldResult._sum.total || 0) * 0.3;

    return {
        totalSold: Number(totalSoldResult._sum.total || 0),
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100
    };
}

/**
 * FINANÇAS - Faturação e despesas
 */
export async function getFinanceMetrics(): Promise<FinanceMetrics> {
    // Receita total
    const totalRevenueResult = await prisma.order.aggregate({
        where: {
            status: 'PAID'
        },
        _sum: {
            total: true
        }
    });

    // Despesas (encomendas a fornecedores)
    const supplierOrdersResult = await prisma.supplierOrder.aggregate({
        _sum: {
            totalAmount: true
        },
        _count: {
            id: true
        }
    });

    return {
        totalRevenue: Number(totalRevenueResult._sum.total || 0),
        totalExpenses: Number(supplierOrdersResult._sum.totalAmount || 0),
        totalSupplierOrders: supplierOrdersResult._count.id,
        supplierOrdersValue: Number(supplierOrdersResult._sum.totalAmount || 0)
    };
}

/**
 * DASHBOARD - Métricas principais
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalClients, totalCompletedOrders, monthlySalesResult] = await Promise.all([
        // Total de clientes
        prisma.user.count({
            where: {
                role: 'CLIENT'
            }
        }),

        // Total de encomendas completas
        prisma.order.count({
            where: {
                status: 'PAID'
            }
        }),

        // Vendas do mês atual
        prisma.order.aggregate({
            where: {
                status: 'PAID',
                createdAt: {
                    gte: currentMonth
                }
            },
            _sum: {
                total: true
            }
        })
    ]);

    return {
        totalClients,
        totalCompletedOrders,
        monthlySales: Number(monthlySalesResult._sum.total || 0)
    };
}

/**
 * DASHBOARD - Estatísticas de vendas por mês (últimos 8 meses)
 */
export async function getMonthlySalesData(): Promise<MonthlySalesData[]> {
    const now = new Date();
    const months: MonthlySalesData[] = [];

    for (let i = 7; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

        const monthData = await prisma.order.aggregate({
            where: {
                status: 'PAID',
                createdAt: {
                    gte: date,
                    lt: nextMonth
                }
            },
            _sum: {
                total: true
            },
            _count: {
                id: true
            }
        });

        months.push({
            month: date.toLocaleDateString('pt-PT', { month: 'short' }),
            year: date.getFullYear(),
            sales: Number(monthData._sum.total || 0),
            revenue: Number(monthData._sum.total || 0),
            orders: monthData._count.id
        });
    }

    return months;
}

/**
 * DASHBOARD - Últimas 5 encomendas mais recentes
 */
export async function getRecentOrders(): Promise<RecentOrder[]> {
    const orders = await prisma.order.findMany({
        take: 5,
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            user: {
                select: {
                    firstName: true, lastName: true,
                    email: true
                }
            }
        }
    });

    return orders.map(order => ({
        id: order.id,
        orderNumber: `ORD-${order.id.slice(-8).toUpperCase()}`,
        customerName: `${order.user.firstName} ${order.user.lastName}`,
        customerEmail: order.user.email,
        total: Number(order.total),
        status: order.status,
        createdAt: order.createdAt
    }));
}

/**
 * ENCOMENDAS - Métricas
 */
export async function getOrderMetrics(): Promise<OrderMetrics> {
    const [pendingOrders, completedOrders, totalProfitResult] = await Promise.all([
        // Encomendas pendentes
        prisma.order.count({
            where: {
                status: 'PENDING'
            }
        }),

        // Encomendas completas
        prisma.order.count({
            where: {
                status: 'PAID'
            }
        }),

        // Lucro total (assumindo 30% de margem)
        prisma.order.aggregate({
            where: {
                status: 'PAID'
            },
            _sum: {
                total: true
            }
        })
    ]);

    const totalProfit = Number(totalProfitResult._sum.total || 0) * 0.3;

    return {
        pendingOrders,
        completedOrders,
        totalProfit: Math.round(totalProfit * 100) / 100
    };
}

/**
 * ENCOMENDAS - Lista completa com paginação
 */
export async function getAllOrders(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
        where.status = status;
    }

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            skip,
            take: limit,
            include: {
                user: {
                    select: {
                        firstName: true, lastName: true,
                        email: true
                    }
                },
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                price: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        }),
        prisma.order.count({ where })
    ]);

    return {
        orders: orders.map(order => ({
            id: order.id,
            orderNumber: `ORD-${order.id.slice(-8).toUpperCase()}`,
            customerName: `${order.user.firstName} ${order.user.lastName}`,
            customerEmail: order.user.email,
            total: Number(order.total),
            status: order.status,
            itemsCount: order.items.length,
            createdAt: order.createdAt
        })),
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}/**
 * UTILIZADORES - Lista completa com informações detalhadas
 */
export async function getAllUsersDetailed(page = 1, limit = 10, role?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (role) {
        where.role = role;
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                createdAt: true,
                // Adicionar campos que possam não existir ainda
                // phone: true,
                // position: true,
                // address: true,
                // city: true,
                // district: true,
                // country: true,
                // postalCode: true,
                // taxNumber: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        }),
        prisma.user.count({ where })
    ]);

    return {
        users: users.map(user => {
            const [firstName, ...lastNameParts] = `${user.firstName} ${user.lastName}`.split(' ');
            return {
                id: user.id,
                firstName,
                lastName: lastNameParts.join(' ') || '',
                email: user.email,
                phone: '', // Para implementar
                position: user.role === 'ADMIN' ? 'Administrador' : 'Cliente',
                address: '', // Para implementar
                city: '', // Para implementar
                district: '', // Para implementar
                country: 'Portugal', // Padrão
                postalCode: '', // Para implementar
                taxNumber: '', // Para implementar
                role: user.role,
                createdAt: user.createdAt
            };
        }),
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}

/**
 * CONTADORES BÁSICOS - Para endpoint /stats
 */
export async function getTotalProducts(): Promise<number> {
    try {
        const count = await prisma.product.count();
        return count;
    } catch (error) {
        console.error('Erro ao contar produtos:', error);
        return 0;
    }
}

export async function getPendingOrders(): Promise<number> {
    try {
        const count = await prisma.order.count({
            where: {
                status: 'PENDING'
            }
        });
        return count;
    } catch (error) {
        console.error('Erro ao contar pedidos pendentes:', error);
        return 0;
    }
}