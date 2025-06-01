import { Response, NextFunction } from 'express';
import * as wishlistService from '../services/wishlist.service';
import { AuthenticatedRequest } from '../middlewares/authenticate';
import { z } from 'zod';

// Schemas de validação
const productIdBodySchema = z.object({
  productId: z.string().min(1)
});
const productIdParamSchema = z.object({
  productId: z.string().min(1)
});

export async function getWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw { message: 'common.unauthorized', status: 401 };
    }
    const userId = req.user.id;
    const wishlist = await wishlistService.getWishlist(userId);
    res.json(wishlist);
  } catch (err) {
    next(err);
  }
}

export async function addToWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw { message: 'common.unauthorized', status: 401 };
    }
    const userId = req.user.id;
    const parsed = productIdBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: 'wishlist.invalid_product', status: 400, details: parsed.error.errors });
    }
    const { productId } = parsed.data;
    const result = await wishlistService.addToWishlist(userId, productId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function removeFromWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw { message: 'common.unauthorized', status: 401 };
    }
    const userId = req.user.id;
    const parsed = productIdParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return next({ message: 'wishlist.invalid_product', status: 400, details: parsed.error.errors });
    }
    const { productId } = parsed.data;
    const result = await wishlistService.removeFromWishlist(userId, productId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function moveWishlistItemToCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw { message: 'common.unauthorized', status: 401 };
    }
    const userId = req.user.id;
    const parsed = productIdBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: 'wishlist.invalid_product', status: 400, details: parsed.error.errors });
    }
    const { productId } = parsed.data;
    const result = await wishlistService.moveToCart(userId, productId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}