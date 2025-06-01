import prisma from '../prisma/client';

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('user.not_found');
  return user;
}