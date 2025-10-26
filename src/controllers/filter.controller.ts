import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

// Validation schema for product filters
const productFilterSchema = z.object({
    category: z.string().optional(),
    minPrice: z.number().positive().optional(),
    maxPrice: z.number().positive().optional(),
    colors: z.array(z.string()).optional(),
    sizes: z.array(z.string()).optional(),
    materials: z.array(z.string()).optional(),
    styles: z.array(z.string()).optional(),
    occasions: z.array(z.string()).optional(),
    seasons: z.array(z.string()).optional(),
    gender: z.string().optional(),
    tags: z.array(z.string()).optional(),
    inStock: z.boolean().optional(),
    sortBy: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest', 'popular']).optional(),
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
});

export class FilterController {
    // Get all available filter options
    static async getFilterOptions(req: Request, res: Response) {
        try {
            // Get all unique values for filter options
            const [
                categories,
                colors,
                sizes,
                materials,
                styles,
                occasions,
                seasons,
                genders,
                allTags
            ] = await Promise.all([
                // Categories
                prisma.category.findMany({
                    where: { isActive: true },
                    select: { id: true, name: true },
                    orderBy: { name: 'asc' }
                }),

                // Colors (from variants)
                prisma.productVariant.findMany({
                    where: { stock: { gt: 0 } },
                    select: { color: true, colorHex: true },
                    distinct: ['color']
                }),

                // Sizes (from variants)
                prisma.productVariant.findMany({
                    where: { stock: { gt: 0 } },
                    select: { size: true },
                    distinct: ['size']
                }),

                // Materials
                prisma.product.findMany({
                    where: {
                        material: { not: null },
                        variants: { some: { stock: { gt: 0 } } }
                    },
                    select: { material: true },
                    distinct: ['material']
                }),

                // Styles
                prisma.product.findMany({
                    where: {
                        style: { not: null },
                        variants: { some: { stock: { gt: 0 } } }
                    },
                    select: { style: true },
                    distinct: ['style']
                }),

                // Occasions
                prisma.product.findMany({
                    where: {
                        occasion: { not: null },
                        variants: { some: { stock: { gt: 0 } } }
                    },
                    select: { occasion: true },
                    distinct: ['occasion']
                }),

                // Seasons
                prisma.product.findMany({
                    where: {
                        season: { not: null },
                        variants: { some: { stock: { gt: 0 } } }
                    },
                    select: { season: true },
                    distinct: ['season']
                }),

                // Genders
                prisma.product.findMany({
                    where: {
                        gender: { not: null },
                        variants: { some: { stock: { gt: 0 } } }
                    },
                    select: { gender: true },
                    distinct: ['gender']
                }),

                // All unique tags
                prisma.product.findMany({
                    where: {
                        NOT: {
                            tags: { equals: Prisma.DbNull }
                        },
                        variants: { some: { stock: { gt: 0 } } }
                    },
                    select: { tags: true }
                })
            ]);

            // Extract unique tags from all products
            const uniqueTags = new Set<string>();
            allTags.forEach((product: any) => {
                product.tags.forEach((tag: string) => uniqueTags.add(tag));
            });            // Get price range
            const priceRange = await prisma.product.aggregate({
                where: {
                    variants: { some: { stock: { gt: 0 } } }
                },
                _min: { price: true },
                _max: { price: true }
            });

            res.json({
                success: true,
                data: {
                    categories: categories,
                    colors: colors.sort((a: any, b: any) => a.color.localeCompare(b.color)),
                    sizes: sizes.map((s: any) => s.size).sort(),
                    materials: materials.map((m: any) => m.material).filter(Boolean).sort(),
                    styles: styles.map((s: any) => s.style).filter(Boolean).sort(),
                    occasions: occasions.map((o: any) => o.occasion).filter(Boolean).sort(),
                    seasons: seasons.map((s: any) => s.season).filter(Boolean).sort(),
                    genders: genders.map((g: any) => g.gender).filter(Boolean).sort(),
                    tags: Array.from(uniqueTags).sort(),
                    priceRange: {
                        min: priceRange._min.price || 0,
                        max: priceRange._max.price || 0
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching filter options:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Filter products based on criteria
    static async filterProducts(req: Request, res: Response) {
        try {
            const validatedData = productFilterSchema.parse(req.query);

            const {
                category,
                minPrice,
                maxPrice,
                colors,
                sizes,
                materials,
                styles,
                occasions,
                seasons,
                gender,
                tags,
                inStock,
                sortBy = 'newest',
                page = 1,
                limit = 20
            } = validatedData;

            // Build where clause
            const whereClause: any = {};

            if (category) {
                whereClause.categoryId = category;
            }

            if (minPrice || maxPrice) {
                whereClause.price = {};
                if (minPrice) whereClause.price.gte = minPrice;
                if (maxPrice) whereClause.price.lte = maxPrice;
            }

            if (materials && materials.length > 0) {
                whereClause.material = { in: materials };
            }

            if (styles && styles.length > 0) {
                whereClause.style = { in: styles };
            }

            if (occasions && occasions.length > 0) {
                whereClause.occasion = { in: occasions };
            }

            if (seasons && seasons.length > 0) {
                whereClause.season = { in: seasons };
            }

            if (gender) {
                whereClause.gender = gender;
            }

            if (tags && tags.length > 0) {
                whereClause.tags = { hasSome: tags };
            }

            // Filter by variant availability
            const variantFilters: any = {};

            if (colors && colors.length > 0) {
                variantFilters.color = { in: colors };
            }

            if (sizes && sizes.length > 0) {
                variantFilters.size = { in: sizes };
            }

            if (inStock) {
                variantFilters.stock = { gt: 0 };
            }

            if (Object.keys(variantFilters).length > 0) {
                whereClause.variants = { some: variantFilters };
            }

            // Build order by clause
            let orderBy: any = { createdAt: 'desc' }; // default to newest

            switch (sortBy) {
                case 'price_asc':
                    orderBy = { price: 'asc' };
                    break;
                case 'price_desc':
                    orderBy = { price: 'desc' };
                    break;
                case 'name_asc':
                    orderBy = { name: 'asc' };
                    break;
                case 'name_desc':
                    orderBy = { name: 'desc' };
                    break;
                case 'popular':
                    orderBy = { sold: 'desc' };
                    break;
                case 'newest':
                default:
                    orderBy = { createdAt: 'desc' };
                    break;
            }

            // Calculate pagination
            const skip = (page - 1) * limit;

            // Get products and total count
            const [products, totalCount] = await Promise.all([
                prisma.product.findMany({
                    where: whereClause,
                    include: {
                        category: true,
                        variants: {
                            where: inStock ? { stock: { gt: 0 } } : undefined,
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
                            orderBy: { sortOrder: 'asc' },
                            take: 5
                        },
                        reviews: {
                            select: {
                                rating: true
                            }
                        },
                        _count: {
                            select: {
                                reviews: true
                            }
                        }
                    },
                    orderBy,
                    skip,
                    take: limit
                }),

                prisma.product.count({
                    where: whereClause
                })
            ]);

            // Calculate average ratings
            const productsWithRatings = products.map((product: any) => {
                const totalRating = product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
                const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0; return {
                    ...product,
                    averageRating: Math.round(averageRating * 10) / 10,
                    reviewCount: product._count.reviews,
                    reviews: undefined, // Remove individual reviews from response
                    _count: undefined
                };
            });

            res.json({
                success: true,
                data: {
                    products: productsWithRatings,
                    pagination: {
                        current: page,
                        total: Math.ceil(totalCount / limit),
                        count: totalCount,
                        perPage: limit,
                        hasNext: page < Math.ceil(totalCount / limit),
                        hasPrev: page > 1
                    }
                }
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Parâmetros de filtro inválidos',
                    errors: error.errors
                });
            }

            console.error('Error filtering products:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Get filter counts for current filter selection
    static async getFilterCounts(req: Request, res: Response) {
        try {
            const validatedData = productFilterSchema.parse(req.query);

            // Similar logic to filterProducts but return counts for each filter option
            // This helps show how many products are available for each filter choice

            const whereClause: any = {};
            // ... build where clause similar to filterProducts ...

            const [
                categoryCount,
                colorCount,
                sizeCount
            ] = await Promise.all([
                // Count products by category
                prisma.product.groupBy({
                    by: ['categoryId'],
                    where: whereClause,
                    _count: { id: true }
                }),

                // Count variants by color
                prisma.productVariant.groupBy({
                    by: ['color'],
                    where: {
                        product: whereClause,
                        stock: { gt: 0 }
                    },
                    _count: { id: true }
                }),

                // Count variants by size
                prisma.productVariant.groupBy({
                    by: ['size'],
                    where: {
                        product: whereClause,
                        stock: { gt: 0 }
                    },
                    _count: { id: true }
                })
            ]);

            res.json({
                success: true,
                data: {
                    categories: categoryCount,
                    colors: colorCount,
                    sizes: sizeCount
                }
            });
        } catch (error) {
            console.error('Error fetching filter counts:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Search products by text
    static async searchProducts(req: Request, res: Response) {
        try {
            const { q, limit = 20, page = 1 } = req.query;

            if (!q || typeof q !== 'string' || q.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Termo de pesquisa deve ter pelo menos 2 caracteres'
                });
            }

            const searchTerm = q.trim();
            const skip = (Number(page) - 1) * Number(limit);

            const [products, totalCount] = await Promise.all([
                prisma.product.findMany({
                    where: {
                        OR: [
                            { name: { contains: searchTerm } },
                            { description: { contains: searchTerm } },
                            { tags: { string_contains: searchTerm } }
                        ]
                    },
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
                        }
                    },
                    orderBy: { sold: 'desc' },
                    skip,
                    take: Number(limit)
                }),

                prisma.product.count({
                    where: {
                        OR: [
                            { name: { contains: searchTerm } },
                            { description: { contains: searchTerm } },
                            { tags: { string_contains: searchTerm } }
                        ]
                    }
                })
            ]);

            res.json({
                success: true,
                data: {
                    products,
                    searchTerm,
                    pagination: {
                        current: Number(page),
                        total: Math.ceil(totalCount / Number(limit)),
                        count: totalCount,
                        perPage: Number(limit)
                    }
                }
            });
        } catch (error) {
            console.error('Error searching products:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}