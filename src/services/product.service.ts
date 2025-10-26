import { redis } from "../lib/redis";
import prisma from '../prisma/client';

const POPULAR_PRODUCTS_KEY = 'popular_products';

export async function getPopularProducts() {
    // Tenta buscar do cache
    const cached = await redis.get(POPULAR_PRODUCTS_KEY);
    if (cached) {
        return JSON.parse(cached);
    }

    // Busca do banco de dados (exemplo: mais vendidos)
    const products = await prisma.product.findMany({
        orderBy: { sold: 'desc' },
        take: 10,
    });

    // Guarda no cache por 1 hora
    await redis.set(POPULAR_PRODUCTS_KEY, JSON.stringify(products), { EX: 3600 });

    return products;
}

export async function getProductById(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error('product.not_found');
    return product;
}