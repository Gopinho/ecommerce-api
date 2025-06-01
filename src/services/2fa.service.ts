import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import prisma from '../prisma/client';

export async function generate2FA(userId: string) {
  const secret = speakeasy.generateSecret({
    name: 'Minha Loja', // Nome que aparece na app
  });

  // Guarda o segredo no user (sem ativar ainda)
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret.base32 },
  });

  // Gera QR code
  const qrCode = await qrcode.toDataURL(secret.otpauth_url!);

  return { qrCode, secret: secret.base32 };
}

export async function verify2FA(userId: string, token: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.twoFactorSecret) throw new Error('2fa.no_setup');

  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 1, // tolerância de tempo
  });

  if (isValid) {
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });
  }

  return isValid;
}

export async function disable2FA(userId: string, token: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    throw new Error('2fa.not_enabled');
  }

  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 1,
  });

  if (!isValid) throw new Error('2fa.invalid_code');

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });

  return true;
}