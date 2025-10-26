import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { z } from 'zod';

// Validation schemas
const createVariantSchema = z.object({
    productId: z.string().uuid(),
    size: z.string().min(1),
    color: z.string().min(1),
    colorHex: z.string().optional(),
    stock: z.number().int().min(0),
    price: z.number().positive().optional(),
    sku: z.string().optional(),
    weight: z.number().positive().optional(),
});

const updateVariantSchema = z.object({
    size: z.string().min(1).optional(),
    color: z.string().min(1).optional(),
    colorHex: z.string().optional(),
    stock: z.number().int().min(0).optional(),
    price: z.number().positive().optional(),
    sku: z.string().optional(),
    weight: z.number().positive().optional(),
});

export class ProductVariantController {
    // Get all variants for a product
    static async getVariantsByProduct(req: Request, res: Response) {
        try {
            const { productId } = req.params;

            const variants = await prisma.productVariant.findMany({
                where: { productId },
                orderBy: [
                    { size: 'asc' },
                    { color: 'asc' }
                ]
            });

            res.json({
                success: true,
                data: variants
            });
        } catch (error) {
            console.error('Error fetching product variants:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Get single variant
    static async getVariant(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const variant = await prisma.productVariant.findUnique({
                where: { id },
                include: {
                    product: true
                }
            });

            if (!variant) {
                return res.status(404).json({
                    success: false,
                    message: 'Variante não encontrada'
                });
            }

            res.json({
                success: true,
                data: variant
            });
        } catch (error) {
            console.error('Error fetching variant:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Create new variant
    static async createVariant(req: Request, res: Response) {
        try {
            const validatedData = createVariantSchema.parse(req.body);

            // Check if product exists
            const product = await prisma.product.findUnique({
                where: { id: validatedData.productId }
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            }

            // Check if variant combination already exists
            const existingVariant = await prisma.productVariant.findUnique({
                where: {
                    productId_size_color: {
                        productId: validatedData.productId,
                        size: validatedData.size,
                        color: validatedData.color
                    }
                }
            });

            if (existingVariant) {
                return res.status(400).json({
                    success: false,
                    message: 'Variante com este tamanho e cor já existe'
                });
            }

            const variant = await prisma.productVariant.create({
                data: validatedData,
                include: {
                    product: true
                }
            });

            res.status(201).json({
                success: true,
                data: variant
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: error.errors
                });
            }

            console.error('Error creating variant:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Update variant
    static async updateVariant(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const validatedData = updateVariantSchema.parse(req.body);

            const existingVariant = await prisma.productVariant.findUnique({
                where: { id }
            });

            if (!existingVariant) {
                return res.status(404).json({
                    success: false,
                    message: 'Variante não encontrada'
                });
            }

            // If updating size or color, check for duplicates
            if (validatedData.size || validatedData.color) {
                const size = validatedData.size || existingVariant.size;
                const color = validatedData.color || existingVariant.color;

                const duplicateVariant = await prisma.productVariant.findFirst({
                    where: {
                        productId: existingVariant.productId,
                        size,
                        color,
                        id: { not: id }
                    }
                });

                if (duplicateVariant) {
                    return res.status(400).json({
                        success: false,
                        message: 'Variante com este tamanho e cor já existe'
                    });
                }
            }

            const variant = await prisma.productVariant.update({
                where: { id },
                data: validatedData,
                include: {
                    product: true
                }
            });

            res.json({
                success: true,
                data: variant
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: error.errors
                });
            }

            console.error('Error updating variant:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Delete variant
    static async deleteVariant(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const variant = await prisma.productVariant.findUnique({
                where: { id }
            });

            if (!variant) {
                return res.status(404).json({
                    success: false,
                    message: 'Variante não encontrada'
                });
            }

            await prisma.productVariant.delete({
                where: { id }
            });

            res.json({
                success: true,
                message: 'Variante eliminada com sucesso'
            });
        } catch (error) {
            console.error('Error deleting variant:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Get available sizes for a product
    static async getAvailableSizes(req: Request, res: Response) {
        try {
            const { productId } = req.params;

            const sizes = await prisma.productVariant.findMany({
                where: {
                    productId,
                    stock: { gt: 0 }
                },
                select: { size: true },
                distinct: ['size']
            });

            res.json({
                success: true,
                data: sizes.map((s: any) => s.size).sort()
            });
        } catch (error) {
            console.error('Error fetching available sizes:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Get available colors for a product (optionally filtered by size)
    static async getAvailableColors(req: Request, res: Response) {
        try {
            const { productId } = req.params;
            const { size } = req.query;

            const whereClause: any = {
                productId,
                stock: { gt: 0 }
            };

            if (size) {
                whereClause.size = size;
            }

            const colors = await prisma.productVariant.findMany({
                where: whereClause,
                select: { color: true, colorHex: true },
                distinct: ['color']
            });

            res.json({
                success: true,
                data: colors
            });
        } catch (error) {
            console.error('Error fetching available colors:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Check stock for specific variant
    static async checkStock(req: Request, res: Response) {
        try {
            const { productId } = req.params;
            const { size, color } = req.query;

            if (!size || !color) {
                return res.status(400).json({
                    success: false,
                    message: 'Tamanho e cor são obrigatórios'
                });
            }

            const variant = await prisma.productVariant.findUnique({
                where: {
                    productId_size_color: {
                        productId,
                        size: size as string,
                        color: color as string
                    }
                }
            });

            if (!variant) {
                return res.status(404).json({
                    success: false,
                    message: 'Variante não encontrada'
                });
            }

            res.json({
                success: true,
                data: {
                    stock: variant.stock,
                    available: variant.stock > 0
                }
            });
        } catch (error) {
            console.error('Error checking stock:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}