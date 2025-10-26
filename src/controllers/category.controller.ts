import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { z } from 'zod';

// Schema de validação
const categorySchema = z.object({
    name: z.string().min(1)
});

export async function createCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = categorySchema.safeParse(req.body);
        if (!parsed.success) {
            return next({ message: 'category.name_required', status: 400, details: parsed.error.errors });
        }
        const { name } = parsed.data;

        const category = await prisma.category.create({ data: { name } });
        res.status(201).json(category);
    } catch (err) {
        next(err);
    }
}

export async function getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (err) {
        next(err);
    }
}

export async function getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        if (!category) {
            return next({ message: 'category.not_found', status: 404 });
        }

        res.json(category);
    } catch (err) {
        next(err);
    }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const parsed = categorySchema.safeParse(req.body);
        if (!parsed.success) {
            return next({ message: 'category.name_required', status: 400, details: parsed.error.errors });
        }
        const { name } = parsed.data;

        const category = await prisma.category.update({
            where: { id },
            data: { name },
        });

        res.json(category);
    } catch (err) {
        next(err);
    }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;

        // Verifica se há produtos associados
        const productsCount = await prisma.product.count({
            where: { categoryId: id },
        });

        if (productsCount > 0) {
            throw { message: 'category.foreign_key_error', status: 400 };
        }

        await prisma.category.delete({ where: { id } });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}