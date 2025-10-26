import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { logAction } from '../services/audit.service';
import { AuthenticatedRequest } from '../middlewares/authenticate';
import { getPopularProducts } from '../services/product.service';
import { z } from 'zod';
import { redis } from '../lib/redis';

// Schema de validação para produto (body) - atualizado para moda
const ProductSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    price: z.number().positive('Preço deve ser positivo'),
    stock: z.number().int().min(0, 'Stock deve ser 0 ou maior'),
    fictionalStock: z.number().int().min(0, 'Stock fictício deve ser 0 ou maior').optional().default(0),
    categoryId: z.string().min(1, 'Categoria é obrigatória'),
    material: z.string().optional(),
    care: z.string().optional(),
    style: z.string().optional(),
    occasion: z.string().optional(),
    season: z.string().optional(),
    gender: z.string().optional(),
    tags: z.array(z.string()).optional().default([])
});

// Schema para validação de params (id)
const idParamSchema = z.object({
    id: z.string().min(1)
});

export async function createProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = ProductSchema.safeParse(req.body);
        if (!parsed.success) {
            return next({ message: 'product.invalid_data', status: 400, details: parsed.error.errors });
        }
        const { name, description, price, stock, categoryId, material, care, style, occasion, season, gender, tags } = parsed.data;

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price,
                stock,
                categoryId,
                material,
                care,
                style,
                occasion,
                season,
                gender,
                tags: tags || []
            },
            include: {
                category: true,
                variants: true,
                images: true
            }
        });

        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
}

export async function getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
        // Aqui poderias validar query params se necessário (ex: paginação)
        const products = await prisma.product.findMany({
            include: {
                category: true,
                variants: {
                    where: { stock: { gt: 0 } },
                    select: {
                        id: true,
                        size: true,
                        color: true,
                        colorHex: true,
                        stock: true,
                        price: true
                    }
                },
                images: {
                    where: { isMain: true },
                    take: 1
                },
                reviews: {
                    select: { rating: true }
                },
                _count: {
                    select: { reviews: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate average ratings
        const productsWithRatings = products.map((product: any) => {
            const totalRating = product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
            const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

            return {
                ...product,
                averageRating: Math.round(averageRating * 10) / 10,
                reviewCount: product._count.reviews,
                reviews: undefined,
                _count: undefined
            };
        });

        res.json(productsWithRatings);
    } catch (err) {
        next(err);
    }
}

export async function getProductById(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = idParamSchema.safeParse(req.params);
        if (!parsed.success) {
            return next({ message: 'product.invalid_id', status: 400, details: parsed.error.errors });
        }
        const { id } = parsed.data;

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                variants: {
                    orderBy: [{ size: 'asc' }, { color: 'asc' }]
                },
                images: {
                    orderBy: { sortOrder: 'asc' }
                },
                reviews: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                productCollections: {
                    include: {
                        collection: true
                    }
                },
                _count: {
                    select: { reviews: true }
                }
            }
        });

        if (!product) throw { message: 'product.not_found', status: 404 };

        // Calculate average rating
        const totalRating = product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
        const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

        const productWithRating = {
            ...product,
            averageRating: Math.round(averageRating * 10) / 10,
            reviewCount: product._count.reviews,
            _count: undefined
        };

        res.json(productWithRating);
    } catch (err) {
        next(err);
    }
}

export async function updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            return next({ message: 'product.invalid_id', status: 400, details: parsedParams.error.errors });
        }
        const { id } = parsedParams.data;

        const userId = req.user?.id;
        if (!userId) {
            throw { message: 'common.unauthorized', status: 401 };
        }

        const parsedBody = ProductSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return next({ message: 'product.invalid_data', status: 400, details: parsedBody.error.errors });
        }
        const { name, description, price, stock, categoryId, material, care, style, occasion, season, gender, tags } = parsedBody.data;

        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) throw { message: 'product.not_found', status: 404 };

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price,
                stock,
                categoryId,
                material,
                care,
                style,
                occasion,
                season,
                gender,
                tags: tags ? tags : (existing.tags as any) || []
            },
            include: {
                category: true,
                variants: true,
                images: true
            }
        }); await logAction(userId, 'UPDATE', 'Product', id);

        res.json(product);
    } catch (err) {
        next(err);
    }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = idParamSchema.safeParse(req.params);
        if (!parsed.success) {
            return next({ message: 'product.invalid_id', status: 400, details: parsed.error.errors });
        }
        const { id } = parsed.data;

        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) throw { message: 'product.not_found', status: 404 };

        await prisma.product.delete({ where: { id } });

        res.status(200).json({ message: req.__('product.deleted') });
    } catch (err) {
        next(err);
    }
}

export async function popularProducts(req: Request, res: Response, next: NextFunction) {
    try {
        const cacheKey = 'popular_products';
        const cached = await redis.get(cacheKey);

        if (cached) {
            return res.json(JSON.parse(cached));
        }

        const products = await getPopularProducts(); // Função já existente
        await redis.set(cacheKey, JSON.stringify(products), { EX: 60 }); // 60 segundos de cache

        res.json(products);
    } catch (err: any) {
        next(err);
    }
}