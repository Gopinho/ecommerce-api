import crypto from 'crypto';
import prisma from '../prisma/client';

export async function generateLicense(orderId: string, productId: string, userId: string, expiresAt?: Date) {
  const key = crypto.randomBytes(16).toString('hex'); // chave random de 32 caracteres

  const license = await prisma.license.create({
    data: {
      orderId,
      productId,
      userId,
      key,
      expiresAt,
      status: 'active',
    },
  });

  return license;
}

export async function validateLicense(key: string) {
  const license = await prisma.license.findUnique({ where: { key } });

  if (!license) throw new Error('license.invalid');
  if (license.status !== 'active') throw new Error('license.revoked');
  if (license.expiresAt && license.expiresAt < new Date()) throw new Error('license.expired');

  return license;
}
