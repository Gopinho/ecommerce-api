import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { z } from 'zod';

// Validation schemas
const createImageSchema = z.object({
    productId: z.string().uuid(),
    url: z.string().url(),
    altText: z.string().optional(),
    sortOrder: z.number().int().min(0).optional(),
    isMain: z.boolean().optional(),
});

const updateImageSchema = z.object({
    url: z.string().url().optional(),
    altText: z.string().optional(),
    sortOrder: z.number().int().min(0).optional(),
    isMain: z.boolean().optional(),
});

export class ProductImageController {
    // Get all images for a product
    static async getImagesByProduct(req: Request, res: Response) {
        try {
            const { productId } = req.params;

            const images = await prisma.productImage.findMany({
                where: { productId },
                orderBy: { sortOrder: 'asc' }
            });

            res.json({
                success: true,
                data: images
            });
        } catch (error) {
            console.error('Error fetching product images:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Create new image
    static async createImage(req: Request, res: Response) {
        try {
            const validatedData = createImageSchema.parse(req.body);

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

            // If this is set as main image, unset others
            if (validatedData.isMain) {
                await prisma.productImage.updateMany({
                    where: {
                        productId: validatedData.productId,
                        isMain: true
                    },
                    data: { isMain: false }
                });
            }

            const image = await prisma.productImage.create({
                data: validatedData
            });

            res.status(201).json({
                success: true,
                data: image
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: error.errors
                });
            }

            console.error('Error creating image:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Update image
    static async updateImage(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const validatedData = updateImageSchema.parse(req.body);

            const existingImage = await prisma.productImage.findUnique({
                where: { id }
            });

            if (!existingImage) {
                return res.status(404).json({
                    success: false,
                    message: 'Imagem não encontrada'
                });
            }

            // If this is set as main image, unset others
            if (validatedData.isMain) {
                await prisma.productImage.updateMany({
                    where: {
                        productId: existingImage.productId,
                        isMain: true,
                        id: { not: id }
                    },
                    data: { isMain: false }
                });
            }

            const image = await prisma.productImage.update({
                where: { id },
                data: validatedData
            });

            res.json({
                success: true,
                data: image
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: error.errors
                });
            }

            console.error('Error updating image:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Delete image
    static async deleteImage(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const image = await prisma.productImage.findUnique({
                where: { id }
            });

            if (!image) {
                return res.status(404).json({
                    success: false,
                    message: 'Imagem não encontrada'
                });
            }

            await prisma.productImage.delete({
                where: { id }
            });

            res.json({
                success: true,
                message: 'Imagem eliminada com sucesso'
            });
        } catch (error) {
            console.error('Error deleting image:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Set main image
    static async setMainImage(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const image = await prisma.productImage.findUnique({
                where: { id }
            });

            if (!image) {
                return res.status(404).json({
                    success: false,
                    message: 'Imagem não encontrada'
                });
            }

            // Unset current main image
            await prisma.productImage.updateMany({
                where: {
                    productId: image.productId,
                    isMain: true
                },
                data: { isMain: false }
            });

            // Set this as main
            const updatedImage = await prisma.productImage.update({
                where: { id },
                data: { isMain: true }
            });

            res.json({
                success: true,
                data: updatedImage
            });
        } catch (error) {
            console.error('Error setting main image:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}