import prisma from '../prisma/client';
import bcrypt from 'bcrypt';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt';
import { addSeconds } from 'date-fns';
import { sendEmail } from '../utils/email';
import speakeasy from 'speakeasy';
import crypto from 'crypto';
import { sendPasswordResetEmail } from './email.service';
import { sendTelegramMessage } from './telegram.service';

const REFRESH_TOKEN_LIFETIME = 60 * 60 * 24 * 7; // 7 dias em segundos

export async function register(email: string, password: string, name: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        const error = new Error('auth.email_in_use') as any;
        error.status = 409; // Conflict
        throw error;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { email, password: hashed, name },
    });

    // Tentar enviar email de boas-vindas (não crítico)
    try {
        await sendEmail(
            email,
            'Bem-vindo à Minha Loja!',
            `<h1>Olá, ${name}!</h1><p>Obrigado por registar na nossa loja.</p>`
        );
    } catch (error) {
        console.warn('⚠️ Falha ao enviar email de boas-vindas:', error);
    }

    return { id: user.id, email: user.email };
}

export async function login(email: string, password: string, token2FA?: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        const error = new Error('auth.invalid_credentials') as any;
        error.status = 401;
        throw error;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        const error = new Error('auth.invalid_credentials') as any;
        error.status = 401;
        throw error;
    }

    // Se 2FA estiver ativo, verificar token
    if (user.twoFactorEnabled) {
        if (!token2FA) {
            const error = new Error('2fa.required') as any;
            error.status = 400;
            throw error;
        }

        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret!,
            encoding: 'base32',
            token: token2FA,
            window: 1,
        });

        if (!isValid) {
            const error = new Error('2fa.invalid_code') as any;
            error.status = 401;
            throw error;
        }
    }

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = await generateRefreshToken(user.id);
    await sendTelegramMessage(`${user.name} Logged In!`);

    return { accessToken, refreshToken };
}

async function generateRefreshToken(userId: string) {
    const payload = { id: userId };
    const token = signRefreshToken(payload);

    const expiresAt = addSeconds(new Date(), REFRESH_TOKEN_LIFETIME);

    await prisma.refreshToken.create({
        data: {
            userId,
            token,
            expiresAt
        },
    });

    return token;
}

export async function refresh(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
        throw new Error('token.invalid');
    }

    const payload = verifyToken(refreshToken) as { id: string };

    const accessToken = signAccessToken({ id: payload.id });
    const newRefreshToken = await generateRefreshToken(payload.id);

    // Revoga o antigo
    await prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { revoked: true },
    });

    return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshToken: string) {
    await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
    });
}

export async function requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('auth.user_not_found');

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 min

    await prisma.passwordResetToken.create({
        data: {
            userId: user.id,
            token,
            expiresAt,
        },
    });

    try {
        await sendPasswordResetEmail(email, token);
    } catch (error) {
        console.warn('⚠️ Falha ao enviar email de reset de password:', error);
    }

    return { message: 'auth.reset_email_sent' };
}

export async function resetPassword(token: string, newPassword: string) {
    const record = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record || record.used || record.expiresAt < new Date()) {
        throw new Error('token.invalid');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: record.userId },
        data: { password: hashed },
    });

    await prisma.passwordResetToken.update({
        where: { token },
        data: { used: true },
    });

    return { message: 'auth.password_updated' };
}
