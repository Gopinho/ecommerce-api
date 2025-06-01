import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { logAction } from '../services/audit.service';
import { AuthenticatedRequest } from '../middlewares/authenticate';
import { getPopularProducts } from '../services/product.service';
import { z } from 'zod';
import redis, { connectRedis } from '../lib/redis';

// Schema de validação para produto (body)
const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  categoryId: z.string().min(1)
});

// Schema para validação de params (id)
const idParamSchema = z.object({
  id: z.string().min(1)
});

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: 'product.invalid_data', status: 400, details: parsed.error.errors });
    }
    const { name, description, price, stock, categoryId } = parsed.data;

    const product = await prisma.product.create({
      data: { name, description, price, stock, categoryId },
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
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
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

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) throw { message: 'product.not_found', status: 404 };

    res.json(product);
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

    const parsedBody = productSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return next({ message: 'product.invalid_data', status: 400, details: parsedBody.error.errors });
    }
    const { name, description, price, stock, categoryId } = parsedBody.data;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw { message: 'product.not_found', status: 404 };

    const product = await prisma.product.update({
      where: { id },
      data: { name, description, price, stock, categoryId },
    });

    await logAction(userId, 'UPDATE', 'Product', id);

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
    await connectRedis();
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