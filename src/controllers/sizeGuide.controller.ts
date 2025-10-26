import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { z } from 'zod';

// Validation schemas
const createSizeGuideSchema = z.object({
    categoryId: z.string().uuid(),
    name: z.string().min(1),
    sizes: z.record(z.object({
        bust: z.number().optional(),
        waist: z.number().optional(),
        hip: z.number().optional(),
        chest: z.number().optional(),
        shoulder: z.number().optional(),
        length: z.number().optional(),
        sleeve: z.number().optional(),
        inseam: z.number().optional(),
        neck: z.number().optional(),
    })),
    unit: z.string().default('cm'),
    notes: z.string().optional(),
});

const updateSizeGuideSchema = z.object({
    name: z.string().min(1).optional(),
    sizes: z.record(z.object({
        bust: z.number().optional(),
        waist: z.number().optional(),
        hip: z.number().optional(),
        chest: z.number().optional(),
        shoulder: z.number().optional(),
        length: z.number().optional(),
        sleeve: z.number().optional(),
        inseam: z.number().optional(),
        neck: z.number().optional(),
    })).optional(),
    unit: z.string().optional(),
    notes: z.string().optional(),
});

export class SizeGuideController {
    // Get all size guides
    static async getSizeGuides(req: Request, res: Response) {
        try {
            const { categoryId } = req.query;

            const whereClause = categoryId ? { categoryId: categoryId as string } : {};

            const sizeGuides = await prisma.sizeGuide.findMany({
                where: whereClause,
                include: {
                    category: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            res.json({
                success: true,
                data: sizeGuides
            });
        } catch (error) {
            console.error('Error fetching size guides:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Get size guide by ID
    static async getSizeGuide(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const sizeGuide = await prisma.sizeGuide.findUnique({
                where: { id },
                include: {
                    category: true
                }
            });

            if (!sizeGuide) {
                return res.status(404).json({
                    success: false,
                    message: 'Guia de tamanhos não encontrado'
                });
            }

            res.json({
                success: true,
                data: sizeGuide
            });
        } catch (error) {
            console.error('Error fetching size guide:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Get size guide by category
    static async getSizeGuideByCategory(req: Request, res: Response) {
        try {
            const { categoryId } = req.params;

            const sizeGuides = await prisma.sizeGuide.findMany({
                where: { categoryId },
                include: {
                    category: true
                },
                orderBy: {
                    name: 'asc'
                }
            });

            res.json({
                success: true,
                data: sizeGuides
            });
        } catch (error) {
            console.error('Error fetching size guides by category:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Create size guide
    static async createSizeGuide(req: Request, res: Response) {
        try {
            const validatedData = createSizeGuideSchema.parse(req.body);

            // Check if category exists
            const category = await prisma.category.findUnique({
                where: { id: validatedData.categoryId }
            });

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoria não encontrada'
                });
            }

            // Check if size guide with same name already exists for this category
            const existingSizeGuide = await prisma.sizeGuide.findUnique({
                where: {
                    categoryId_name: {
                        categoryId: validatedData.categoryId,
                        name: validatedData.name
                    }
                }
            });

            if (existingSizeGuide) {
                return res.status(400).json({
                    success: false,
                    message: 'Guia de tamanhos com este nome já existe para esta categoria'
                });
            }

            const sizeGuide = await prisma.sizeGuide.create({
                data: validatedData,
                include: {
                    category: true
                }
            });

            res.status(201).json({
                success: true,
                data: sizeGuide
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: error.errors
                });
            }

            console.error('Error creating size guide:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Update size guide
    static async updateSizeGuide(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const validatedData = updateSizeGuideSchema.parse(req.body);

            const existingSizeGuide = await prisma.sizeGuide.findUnique({
                where: { id }
            });

            if (!existingSizeGuide) {
                return res.status(404).json({
                    success: false,
                    message: 'Guia de tamanhos não encontrado'
                });
            }

            // Check for name conflicts if name is being updated
            if (validatedData.name && validatedData.name !== existingSizeGuide.name) {
                const duplicateGuide = await prisma.sizeGuide.findFirst({
                    where: {
                        categoryId: existingSizeGuide.categoryId,
                        name: validatedData.name,
                        id: { not: id }
                    }
                });

                if (duplicateGuide) {
                    return res.status(400).json({
                        success: false,
                        message: 'Guia de tamanhos com este nome já existe para esta categoria'
                    });
                }
            }

            const sizeGuide = await prisma.sizeGuide.update({
                where: { id },
                data: validatedData,
                include: {
                    category: true
                }
            });

            res.json({
                success: true,
                data: sizeGuide
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: error.errors
                });
            }

            console.error('Error updating size guide:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Delete size guide
    static async deleteSizeGuide(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const sizeGuide = await prisma.sizeGuide.findUnique({
                where: { id }
            });

            if (!sizeGuide) {
                return res.status(404).json({
                    success: false,
                    message: 'Guia de tamanhos não encontrado'
                });
            }

            await prisma.sizeGuide.delete({
                where: { id }
            });

            res.json({
                success: true,
                message: 'Guia de tamanhos eliminado com sucesso'
            });
        } catch (error) {
            console.error('Error deleting size guide:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Get size recommendation based on measurements
    static async getSizeRecommendation(req: Request, res: Response) {
        try {
            const { categoryId } = req.params;
            const { bust, waist, hip, chest } = req.query;

            if (!bust && !waist && !hip && !chest) {
                return res.status(400).json({
                    success: false,
                    message: 'Pelo menos uma medida é obrigatória'
                });
            }

            const sizeGuides = await prisma.sizeGuide.findMany({
                where: { categoryId }
            });

            if (sizeGuides.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Nenhum guia de tamanhos encontrado para esta categoria'
                });
            }

            // Simple recommendation algorithm
            const recommendations = [];

            for (const guide of sizeGuides) {
                const sizes = guide.sizes as Record<string, any>;
                let bestSize = null;
                let minDifference = Infinity;

                for (const [sizeName, measurements] of Object.entries(sizes)) {
                    const typedMeasurements = measurements as {
                        bust?: number;
                        waist?: number;
                        hip?: number;
                        chest?: number;
                        [key: string]: any;
                    };

                    let totalDifference = 0;
                    let measurementCount = 0;

                    if (bust && typedMeasurements.bust) {
                        totalDifference += Math.abs(parseFloat(bust as string) - typedMeasurements.bust);
                        measurementCount++;
                    }
                    if (waist && typedMeasurements.waist) {
                        totalDifference += Math.abs(parseFloat(waist as string) - typedMeasurements.waist);
                        measurementCount++;
                    }
                    if (hip && typedMeasurements.hip) {
                        totalDifference += Math.abs(parseFloat(hip as string) - typedMeasurements.hip);
                        measurementCount++;
                    }
                    if (chest && typedMeasurements.chest) {
                        totalDifference += Math.abs(parseFloat(chest as string) - typedMeasurements.chest);
                        measurementCount++;
                    } if (measurementCount > 0) {
                        const avgDifference = totalDifference / measurementCount;
                        if (avgDifference < minDifference) {
                            minDifference = avgDifference;
                            bestSize = sizeName;
                        }
                    }
                }

                if (bestSize) {
                    recommendations.push({
                        guideId: guide.id,
                        guideName: guide.name,
                        recommendedSize: bestSize,
                        confidence: Math.max(0, 100 - minDifference * 2) // Simple confidence score
                    });
                }
            }

            res.json({
                success: true,
                data: recommendations
            });
        } catch (error) {
            console.error('Error getting size recommendation:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}