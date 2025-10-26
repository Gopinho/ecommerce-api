import prisma from '../prisma/client';

export interface CreateSupplierData {
    name: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    taxNumber?: string;
    website?: string;
    notes?: string;
    paymentTerms?: string;
    currency?: string;
}

export interface UpdateSupplierData {
    name?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    taxNumber?: string;
    website?: string;
    notes?: string;
    isActive?: boolean;
    paymentTerms?: string;
    currency?: string;
}

export async function createSupplier(data: CreateSupplierData) {
    const supplier = await prisma.supplier.create({
        data
    });
    return supplier;
}

export async function getAllSuppliers(page = 1, limit = 10, isActive?: boolean, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { contactName: { contains: search } },
            { email: { contains: search } }
        ];
    }

    const [suppliers, total] = await Promise.all([
        prisma.supplier.findMany({
            where,
            skip,
            take: limit,
            include: {
                supplierOrders: {
                    select: {
                        id: true,
                        orderNumber: true,
                        status: true,
                        totalAmount: true,
                        orderDate: true
                    },
                    orderBy: { orderDate: 'desc' },
                    take: 5 // Últimas 5 encomendas
                },
                _count: {
                    select: {
                        supplierOrders: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        }),
        prisma.supplier.count({ where })
    ]);

    return {
        suppliers,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}

export async function getSupplierById(id: string) {
    const supplier = await prisma.supplier.findUnique({
        where: { id },
        include: {
            supplierOrders: {
                include: {
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
                },
                orderBy: { orderDate: 'desc' }
            }
        }
    });

    if (!supplier) {
        throw new Error('supplier.not_found');
    }

    return supplier;
}

export async function updateSupplier(id: string, data: UpdateSupplierData) {
    // Verificar se o fornecedor existe
    await getSupplierById(id);

    const supplier = await prisma.supplier.update({
        where: { id },
        data
    });

    return supplier;
}

export async function deleteSupplier(id: string) {
    // Verificar se o fornecedor existe
    await getSupplierById(id);

    // Verificar se tem encomendas ativas
    const activeOrders = await prisma.supplierOrder.count({
        where: {
            supplierId: id,
            status: {
                in: ['PENDENTE', 'ENVIADA']
            }
        }
    });

    if (activeOrders > 0) {
        throw new Error('supplier.has_active_orders');
    }

    await prisma.supplier.delete({
        where: { id }
    });

    return { message: 'Fornecedor deletado com sucesso' };
}

export async function getSupplierStats() {
    const [
        totalSuppliers,
        activeSuppliers,
        inactiveSuppliers,
        totalOrders,
        pendingOrders
    ] = await Promise.all([
        prisma.supplier.count(),
        prisma.supplier.count({ where: { isActive: true } }),
        prisma.supplier.count({ where: { isActive: false } }),
        prisma.supplierOrder.count(),
        prisma.supplierOrder.count({ where: { status: 'PENDENTE' } })
    ]);

    return {
        totalSuppliers,
        activeSuppliers,
        inactiveSuppliers,
        totalOrders,
        pendingOrders
    };
}

export async function toggleSupplierStatus(id: string) {
    const supplier = await getSupplierById(id);

    const updatedSupplier = await prisma.supplier.update({
        where: { id },
        data: {
            isActive: !supplier.isActive
        }
    });

    return updatedSupplier;
}