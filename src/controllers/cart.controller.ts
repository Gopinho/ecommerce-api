import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middlewares/authenticate';
import { z } from 'zod';

// Schemas de validação
const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1)
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1)
});

// GET /cart - ver carrinho do utilizador logado
export async function getCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

// POST /cart - adicionar item ao carrinho
export async function addToCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw { message: 'auth.not_authenticated', status: 401 };
    }

    const parsed = addToCartSchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: 'cart.invalid_data', status: 400, details: parsed.error.errors });
    }
    const { productId, quantity } = parsed.data;

    // verifica se já existe item do mesmo produto
    const existing = await prisma.cartItem.findFirst({
      where: { userId, productId },
    });

    let item;
    if (existing) {
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      item = await prisma.cartItem.create({
        data: { userId, productId, quantity },
      });
    }

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

// PUT /cart/:id - atualizar quantidade
export async function updateCartItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const parsed = updateCartItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: 'cart.invalid_quantity', status: 400, details: parsed.error.errors });
    }
    const { quantity } = parsed.data;

    const item = await prisma.cartItem.findUnique({ where: { id } });
    if (!item || item.userId !== userId) {
      throw { message: 'cart.item_not_found', status: 404 };
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE /cart/:id - remover item
export async function removeCartItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const item = await prisma.cartItem.findUnique({ where: { id } });
    if (!item || item.userId !== userId) {
      throw { message: 'cart.item_not_found', status: 404 };
    }

    await prisma.cartItem.delete({ where: { id } });

    res.status(200).json({ message: req.__('cart.item_removed') });
  } catch (err) {
    next(err);
  }
}