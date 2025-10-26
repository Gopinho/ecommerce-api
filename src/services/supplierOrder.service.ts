import prisma from '../prisma/client';
import { SupplierOrderStatus } from '@prisma/client';

export interface CreateSupplierOrderData {
    supplierId: string;
    orderNumber?: string;
    expectedDate?: Date;
    notes?: string;
    currency?: string;
    items: CreateSupplierOrderItemData[];
}

export interface CreateSupplierOrderItemData {
    productId?: string;
    productName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    sku?: string;
}

export interface UpdateSupplierOrderData {
    status?: SupplierOrderStatus;
    expectedDate?: Date;
    receivedDate?: Date;
    notes?: string;
    invoiceNumber?: string;
}

export interface UpdateSupplierOrderItemData {
    receivedQuantity?: number;
}

// Gerar número único de encomenda
async function generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.supplierOrder.count({
        where: {
            orderDate: {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`)
            }
        }
    });

    const orderNumber = `PO${year}${String(count + 1).padStart(4, '0')}`;
    return orderNumber;
}

export async function createSupplierOrder(data: CreateSupplierOrderData, createdById: string) {
    // Verificar se o fornecedor existe
    const supplier = await prisma.supplier.findUnique({
        where: { id: data.supplierId }
    });

    if (!supplier) {
        throw new Error('supplier.not_found');
    }

    // Gerar número da encomenda se não fornecido
    const orderNumber = data.orderNumber || await generateOrderNumber();

    // Verificar se o número da encomenda já existe
    const existingOrder = await prisma.supplierOrder.findUnique({
        where: { orderNumber }
    });

    if (existingOrder) {
        throw new Error('supplier_order.number_exists');
    }

    // Calcular total
    const totalAmount = data.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
    }, 0);

    const supplierOrder = await prisma.supplierOrder.create({
        data: {
            orderNumber,
            supplierId: data.supplierId,
            expectedDate: data.expectedDate,
            totalAmount,
            currency: data.currency || 'EUR',
            notes: data.notes,
            createdById,
            items: {
                create: data.items.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.quantity * item.unitPrice,
                    sku: item.sku
                }))
            }
        },
        include: {
            supplier: {
                select: {
                    id: true,
                    name: true,
                    contactName: true,
                    email: true
                }
            },
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            },
            createdBy: {
                select: {
                    id: true,
                    firstName: true, lastName: true,
                    email: true
                }
            }
        }
    });

    return supplierOrder;
}

export async function getAllSupplierOrders(
    page = 1,
    limit = 10,
    status?: SupplierOrderStatus,
    supplierId?: string,
    search?: string
) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;
    if (search) {
        where.OR = [
            { orderNumber: { contains: search } },
            { invoiceNumber: { contains: search } },
            { supplier: { name: { contains: search } } }
        ];
    }

    const [orders, total] = await Promise.all([
        prisma.supplierOrder.findMany({
            where,
            skip,
            take: limit,
            include: {
                supplier: {
                    select: {
                        id: true,
                        name: true,
                        contactName: true
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        firstName: true, lastName: true
                    }
                },
                _count: {
                    select: {
                        items: true
                    }
                }
            },
            orderBy: { orderDate: 'desc' }
        }),
        prisma.supplierOrder.count({ where })
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

export async function getSupplierOrderById(id: string) {
    const order = await prisma.supplierOrder.findUnique({
        where: { id },
        include: {
            supplier: true,
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            stock: true
                        }
                    }
                }
            },
            createdBy: {
                select: {
                    id: true,
                    firstName: true, lastName: true,
                    email: true
                }
            }
        }
    });

    if (!order) {
        throw new Error('supplier_order.not_found');
    }

    return order;
}

export async function updateSupplierOrder(id: string, data: UpdateSupplierOrderData) {
    // Verificar se a encomenda existe
    await getSupplierOrderById(id);

    // Se estiver a marcar como recebida, definir data de recepção
    if (data.status === 'RECEBIDA' && !data.receivedDate) {
        data.receivedDate = new Date();
    }

    const order = await prisma.supplierOrder.update({
        where: { id },
        data,
        include: {
            supplier: true,
            items: {
                include: {
                    product: true
                }
            },
            createdBy: {
                select: {
                    id: true,
                    firstName: true, lastName: true,
                    email: true
                }
            }
        }
    });

    return order;
}

export async function updateSupplierOrderItem(id: string, itemId: string, data: UpdateSupplierOrderItemData) {
    // Verificar se a encomenda e item existem
    const order = await getSupplierOrderById(id);
    const item = await prisma.supplierOrderItem.findFirst({
        where: {
            id: itemId,
            supplierOrderId: id
        }
    });

    if (!item) {
        throw new Error('supplier_order_item.not_found');
    }

    const updatedItem = await prisma.supplierOrderItem.update({
        where: { id: itemId },
        data,
        include: {
            product: true
        }
    });

    return updatedItem;
}

export async function deleteSupplierOrder(id: string) {
    // Verificar se a encomenda existe
    const order = await getSupplierOrderById(id);

    // Só permite deletar se estiver pendente
    if (order.status !== 'PENDENTE') {
        throw new Error('supplier_order.cannot_delete');
    }

    await prisma.supplierOrder.delete({
        where: { id }
    });

    return { message: 'Encomenda deletada com sucesso' };
}

export async function getSupplierOrderStats() {
    const [
        totalOrders,
        pendingOrders,
        sentOrders,
        receivedOrders,
        totalValue,
        pendingValue
    ] = await Promise.all([
        prisma.supplierOrder.count(),
        prisma.supplierOrder.count({ where: { status: 'PENDENTE' } }),
        prisma.supplierOrder.count({ where: { status: 'ENVIADA' } }),
        prisma.supplierOrder.count({ where: { status: 'RECEBIDA' } }),
        prisma.supplierOrder.aggregate({
            _sum: { totalAmount: true }
        }),
        prisma.supplierOrder.aggregate({
            where: { status: 'PENDENTE' },
            _sum: { totalAmount: true }
        })
    ]);

    return {
        totalOrders,
        pendingOrders,
        sentOrders,
        receivedOrders,
        totalValue: totalValue._sum.totalAmount || 0,
        pendingValue: pendingValue._sum.totalAmount || 0
    };
}

export async function markOrderAsSent(id: string) {
    return updateSupplierOrder(id, { status: 'ENVIADA' });
}

export async function markOrderAsReceived(id: string) {
    const order = await updateSupplierOrder(id, {
        status: 'RECEBIDA',
        receivedDate: new Date()
    });

    // Opcional: Atualizar stock dos produtos
    // for (const item of order.items) {
    //     if (item.productId && item.receivedQuantity > 0) {
    //         await prisma.product.update({
    //             where: { id: item.productId },
    //             data: {
    //                 stock: {
    //                     increment: item.receivedQuantity
    //                 }
    //             }
    //         });
    //     }
    // }

    return order;
}