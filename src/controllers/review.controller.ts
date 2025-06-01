import { Request, Response, NextFunction } from 'express';
import * as reviewService from '../services/review.service';
import { AuthenticatedRequest } from '../middlewares/authenticate';
import { z } from 'zod';

// Schema de validação para review
const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional()
});

export async function createOrUpdate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw { message: 'auth.not_authenticated', status: 401 };
    const userId = req.user.id;
    const { productId } = req.params;

    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return next({ message: 'review.invalid_data', status: 400, details: parsed.error.errors });
    }
    const { rating, comment } = parsed.data;

    const review = await reviewService.createOrUpdateReview(userId, productId, rating, comment);
    res.status(200).json(review);
  } catch (err) {
    next(err);
  }
}

export async function getByProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params;
    const reviews = await reviewService.getReviews(productId);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

export async function getAverage(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params;
    const stats = await reviewService.getAverageRating(productId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw { message: 'common.unauthorized', status: 401 };
    const userId = req.user.id;
    const { productId } = req.params;

    await reviewService.deleteReview(userId, productId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function getByUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const reviews = await reviewService.getReviewsByUser(userId);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}