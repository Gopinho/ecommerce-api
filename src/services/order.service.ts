import prisma from '../prisma/client';
import { OrderStatus } from '@prisma/client';
import { decimalToNumber } from '../utils/decimal';

export interface CreateOrderData {
    userId: string;
    shippingAddressId: string;
    items: {
        productId: string;
        variantId?: string;
        quantity: number;
        price: number;
    }[];
    couponId?: string;
}

export async function createOrder(data: CreateOrderData) {
    const { userId, shippingAddressId, items, couponId } = data;

    // Calcular total
    let total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Aplicar cupom se fornecido
    let coupon = null;
    if (couponId) {
        coupon = await prisma.coupon.findUnique({
            where: { id: couponId }
        });

        if (coupon && coupon.expiresAt > new Date()) {
            if (coupon.discountType === 'percent') {
                total = total * (1 - decimalToNumber(coupon.amount) / 100);
            } else if (coupon.discountType === 'fixed') {
                total = Math.max(0, total - decimalToNumber(coupon.amount));
            }
        }
    }

    // Criar encomenda com items
    const order = await prisma.order.create({
        data: {
            userId,
            shippingAddressId,
            total,
            couponId,
            status: OrderStatus.PENDING,
            items: {
                create: items.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.price
                }))
            }
        },
        include: {
            items: {
                include: {
                    product: true,
                    variant: true
                }
            },
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                }
            },
            coupon: true
        }
    });

    // Atualizar stock dos produtos
    for (const item of items) {
        if (item.variantId) {
            await prisma.productVariant.update({
                where: { id: item.variantId },
                data: {
                    stock: {
                        decrement: item.quantity
                    }
                }
            });
        } else {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: item.quantity
                    },
                    sold: {
                        increment: item.quantity
                    }
                }
            });
        }
    }

    return order;
}

export async function getAllOrders(page = 1, limit = 10, status?: OrderStatus) {
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            skip,
            take: limit,
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true
                            }
                        },
                        variant: {
                            select: {
                                id: true,
                                size: true,
                                color: true
                            }
                        }
                    }
                },
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                coupon: {
                    select: {
                        id: true,
                        code: true,
                        discountType: true,
                        amount: true
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
        orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}

export async function getOrderById(id: string) {
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    product: true,
                    variant: true
                }
            },
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                }
            },
            coupon: true
        }
    });

    if (!order) {
        throw new Error('order.not_found');
    }

    return order;
}

export async function getUserOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where: { userId },
            skip,
            take: limit,
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true
                            }
                        },
                        variant: {
                            select: {
                                id: true,
                                size: true,
                                color: true
                            }
                        }
                    }
                },
                coupon: {
                    select: {
                        code: true,
                        discountType: true,
                        amount: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        }),
        prisma.order.count({ where: { userId } })
    ]);

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
    const order = await prisma.order.update({
        where: { id },
        data: { status },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true
                }
            }
        }
    });

    return order;
}

export async function cancelOrder(id: string, userId?: string) {
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: true
        }
    });

    if (!order) {
        throw new Error('order.not_found');
    }

    // Verificar se o utilizador pode cancelar esta encomenda
    if (userId && order.userId !== userId) {
        throw new Error('order.unauthorized');
    }

    // Só pode cancelar se estiver PENDING
    if (order.status !== OrderStatus.PENDING) {
        throw new Error('order.cannot_cancel');
    }

    // Restaurar stock
    for (const item of order.items) {
        if (item.variantId) {
            await prisma.productVariant.update({
                where: { id: item.variantId },
                data: {
                    stock: {
                        increment: item.quantity
                    }
                }
            });
        } else {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        increment: item.quantity
                    },
                    sold: {
                        decrement: item.quantity
                    }
                }
            });
        }
    }

    // Atualizar status
    const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED }
    });

    return updatedOrder;
}

export async function getOrderStats() {
    const [
        totalOrders,
        pendingOrders,
        paidOrders,
        shippedOrders,
        cancelledOrders,
        totalRevenue
    ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: OrderStatus.PENDING } }),
        prisma.order.count({ where: { status: OrderStatus.PAID } }),
        prisma.order.count({ where: { status: OrderStatus.SHIPPED } }),
        prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
        prisma.order.aggregate({
            where: {
                status: {
                    in: [OrderStatus.PAID, OrderStatus.SHIPPED]
                }
            },
            _sum: {
                total: true
            }
        })
    ]);

    return {
        totalOrders,
        pendingOrders,
        paidOrders,
        shippedOrders,
        cancelledOrders,
        totalRevenue: decimalToNumber(totalRevenue._sum.total || 0)
    };
}