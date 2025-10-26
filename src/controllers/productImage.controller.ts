import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

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

// Upload validation schema
const uploadImageSchema = z.object({
    productId: z.string().uuid(),
    altText: z.string().optional(),
    sortOrder: z.number().int().min(0).optional(),
    isMain: z.boolean().optional(),
});

export class ProductImageController {
    // Upload multiple images for a product
    static async uploadMultipleImages(req: Request, res: Response) {
        try {
            const files = req.files as Express.Multer.File[];

            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Nenhuma imagem foi enviada'
                });
            }

            // Validate body data
            const validatedData = uploadImageSchema.parse(req.body);

            // Check if product exists
            const product = await prisma.product.findUnique({
                where: { id: validatedData.productId }
            });

            if (!product) {
                // Remove uploaded files if product doesn't exist
                files.forEach(file => {
                    try {
                        fs.unlinkSync(file.path);
                    } catch (error) {
                        console.error('Error removing file:', error);
                    }
                });

                return res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            }

            // Get current image count for sort order
            const currentImageCount = await prisma.productImage.count({
                where: { productId: validatedData.productId }
            });

            // Create image records for all uploaded files
            const createdImages = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const imageUrl = `/uploads/images/${file.filename}`;

                // Only the first image can be set as main if specified
                const isMainImage = validatedData.isMain && i === 0;

                // If this is set as main image, unset others (only for first image)
                if (isMainImage) {
                    await prisma.productImage.updateMany({
                        where: {
                            productId: validatedData.productId,
                            isMain: true
                        },
                        data: { isMain: false }
                    });
                }

                const image = await prisma.productImage.create({
                    data: {
                        productId: validatedData.productId,
                        url: imageUrl,
                        altText: validatedData.altText || `${product.name} - Imagem ${currentImageCount + i + 1}`,
                        sortOrder: (validatedData.sortOrder || currentImageCount) + i,
                        isMain: isMainImage
                    }
                });

                createdImages.push(image);
            }

            res.status(201).json({
                success: true,
                message: `${files.length} imagem(ns) carregada(s) com sucesso`,
                data: {
                    count: files.length,
                    images: createdImages
                }
            });
        } catch (error) {
            // Remove uploaded files in case of error
            const files = req.files as Express.Multer.File[];
            if (files) {
                files.forEach(file => {
                    try {
                        fs.unlinkSync(file.path);
                    } catch (unlinkError) {
                        console.error('Error removing uploaded file:', unlinkError);
                    }
                });
            }

            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: error.errors
                });
            }

            console.error('Error uploading multiple images:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Upload image file for a product
    static async uploadImage(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Nenhuma imagem foi enviada'
                });
            }

            // Validate body data
            const validatedData = uploadImageSchema.parse(req.body);

            // Check if product exists
            const product = await prisma.product.findUnique({
                where: { id: validatedData.productId }
            });

            if (!product) {
                // Remove uploaded file if product doesn't exist
                fs.unlinkSync(req.file.path);
                return res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            }

            // Generate image URL (relative path)
            const imageUrl = `/uploads/images/${req.file.filename}`;

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

            // Create image record in database
            const image = await prisma.productImage.create({
                data: {
                    productId: validatedData.productId,
                    url: imageUrl,
                    altText: validatedData.altText || req.file.originalname,
                    sortOrder: validatedData.sortOrder || 0,
                    isMain: validatedData.isMain || false
                }
            });

            res.status(201).json({
                success: true,
                message: 'Imagem carregada com sucesso',
                data: image
            });
        } catch (error) {
            // Remove uploaded file in case of error
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (unlinkError) {
                    console.error('Error removing uploaded file:', unlinkError);
                }
            }

            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: error.errors
                });
            }

            console.error('Error uploading image:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

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

    // Reorder product images
    static async reorderImages(req: Request, res: Response) {
        try {
            const { productId } = req.params;

            // Validate request body - array of {id, sortOrder}
            const reorderSchema = z.array(z.object({
                id: z.string().uuid(),
                sortOrder: z.number().int().min(0)
            }));

            const imageUpdates = reorderSchema.parse(req.body);

            // Check if product exists
            const product = await prisma.product.findUnique({
                where: { id: productId }
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            }

            // Verify all images belong to this product
            const imageIds = imageUpdates.map(update => update.id);
            const existingImages = await prisma.productImage.findMany({
                where: {
                    id: { in: imageIds },
                    productId: productId
                }
            });

            if (existingImages.length !== imageIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Uma ou mais imagens não pertencem a este produto'
                });
            }

            // Update sort orders
            const updatePromises = imageUpdates.map(update =>
                prisma.productImage.update({
                    where: { id: update.id },
                    data: { sortOrder: update.sortOrder }
                })
            );

            const updatedImages = await Promise.all(updatePromises);

            res.json({
                success: true,
                message: 'Ordem das imagens atualizada com sucesso',
                data: updatedImages
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: error.errors
                });
            }

            console.error('Error reordering images:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}