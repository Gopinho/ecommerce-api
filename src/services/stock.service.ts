import prisma from '../prisma/client';

export interface UpdateStockData {
    realStock?: number;
    fictionalStock?: number;
}

/**
 * Atualizar stock real e/ou fictício de um produto
 */
export async function updateProductStock(productId: string, data: UpdateStockData) {
    const product = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!product) {
        throw new Error('product.not_found');
    }

    const updateData: any = {};
    if (data.realStock !== undefined) {
        updateData.stock = data.realStock;
    }
    if (data.fictionalStock !== undefined) {
        updateData.fictionalStock = data.fictionalStock;
    }

    const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: updateData
    });

    return updatedProduct;
}

/**
 * Obter informações básicas de stock de um produto
 */
export async function getProductStock(productId: string) {
    const product = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!product) {
        throw new Error('product.not_found');
    }

    return product;
}

/**
 * Obter produtos com stock baixo
 */
export async function getProductsWithLowStock(threshold = 10) {
    const products = await prisma.product.findMany({
        where: {
            stock: {
                lte: threshold
            }
        },
        include: {
            category: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            stock: 'asc'
        }
    });

    return products;
}