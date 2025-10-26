import prisma from '../prisma/client';

export async function createOrUpdateReview(userId: string, productId: string, rating: number, comment?: string) {
  if (rating < 1 || rating > 5) throw new Error('review.invalid_rating');

  const existing = await prisma.review.findUnique({ where: { userId_productId: { userId, productId } } });

  if (existing) {
    return await prisma.review.update({
      where: { userId_productId: { userId, productId } },
      data: { rating, comment },
    });
  }

  return await prisma.review.create({
    data: { userId, productId, rating, comment },
  });
}

export async function getReviews(productId: string) {
  return await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteReview(userId: string, productId: string) {
  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (!existing) {
    throw new Error('review.not_found');
  }

  return await prisma.review.delete({
    where: { userId_productId: { userId, productId } },
  });
}

export async function getAverageRating(productId: string) {
  const result = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: true,
  });

  return {
    average: result._avg.rating ?? 0,
    count: result._count,
  };
}

export async function getReviewsByUser(userId: string) {
  return prisma.review.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  });
}