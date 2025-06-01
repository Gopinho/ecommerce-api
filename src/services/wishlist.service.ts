import prisma from '../prisma/client';

export async function addToWishlist(userId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error('product.not_found');

  await prisma.user.update({
    where: { id: userId },
    data: {
      wishlist: { connect: { id: productId } },
    },
  });

  return { message: 'product.added_wishlist' };
}

export async function removeFromWishlist(userId: string, productId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      wishlist: { disconnect: { id: productId } },
    },
  });

  return { message: 'product.removed_wishlist' };
}

export async function getWishlist(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wishlist: true,
    },
  });

  return user?.wishlist ?? [];
}

export async function moveToCart(userId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error('product.not_found');

  // Remover da wishlist
  await prisma.user.update({
    where: { id: userId },
    data: {
      wishlist: { disconnect: { id: productId } },
    },
  });

  // Adicionar ao carrinho (incrementar se já existir)
  const existingItem = await prisma.cartItem.findFirst({
    where: { userId, productId },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + 1 },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity: 1,
      },
    });
  }

  return { message: 'Produto movido da wishlist para o carrinho' };
}
