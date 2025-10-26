import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { OrderStatus } from '@prisma/client';
import { sendOrderNotification, sendTelegramMessage } from '../services/telegram.service';
import prisma from '../prisma/client';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
        email?: string;
        name?: string;
    };
}

export async function createOrder(req: AuthenticatedRequest, res: Response) {
    try {
        const { items, couponId, shippingAddressId } = req.body;
        const userId = req.user!.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Items são obrigatórios' });
        }

        if (!shippingAddressId) {
            return res.status(400).json({ error: 'Endereço de envio é obrigatório' });
        }

        // Verificar se o endereço pertence ao utilizador
        const address = await prisma.userAddress.findFirst({
            where: {
                id: shippingAddressId,
                userId: userId
            }
        });

        if (!address) {
            return res.status(400).json({ error: 'Endereço de envio inválido' });
        }

        const order = await orderService.createOrder({
            userId,
            shippingAddressId,
            items,
            couponId
        });

        // Enviar notificação detalhada da encomenda via Telegram
        try {
            // Get user details for notification
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true }
            });

            await sendOrderNotification({
                orderId: order.id,
                userId: order.userId,
                userEmail: user?.email || "N/A",
                total: parseFloat(order.total.toString()),
                items: [], // Items will be fetched within the notification service
                paymentMethod: 'Stripe',
                shippingAddress: `Address ID: ${shippingAddressId}`
            });
        } catch (telegramError) {
            console.error('Failed to send order notification:', telegramError);
            // Continua o processo mesmo se falhar o Telegram
        }

        res.status(201).json(order);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function getAllOrders(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as OrderStatus;

        const result = await orderService.getAllOrders(page, limit, status);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function getOrderById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const order = await orderService.getOrderById(id);
        res.json(order);
    } catch (error: any) {
        if (error.message === 'order.not_found') {
            return res.status(404).json({ error: 'Encomenda não encontrada' });
        }
        res.status(500).json({ error: error.message });
    }
}

export async function getUserOrders(req: AuthenticatedRequest, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const userId = req.user!.id;

        const result = await orderService.getUserOrders(userId, page, limit);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function updateOrderStatus(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!Object.values(OrderStatus).includes(status)) {
            return res.status(400).json({ error: 'Status inválido' });
        }

        const order = await orderService.updateOrderStatus(id, status);

        // Notificação de atualização de status
        const statusEmojis: Record<string, string> = {
            'PENDING': '⏳',
            'PROCESSING': '🔄',
            'SHIPPED': '🚚',
            'DELIVERED': '✅',
            'CANCELLED': '❌'
        };

        // Buscar dados completos da ordem para notificação
        const fullOrder = await orderService.getOrderById(id);

        await sendTelegramMessage(
            `${statusEmojis[status] || '📋'} <b>Status Atualizado</b>\n\n` +
            `📦 <b>Encomenda:</b> #${order.id}\n` +
            `📧 <b>Cliente:</b> ${fullOrder.user.email}\n` +
            `🔄 <b>Novo Status:</b> ${status}\n` +
            `⏰ <b>Data:</b> ${new Date().toLocaleString('pt-PT')}`
        );

        res.json(order);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function cancelOrder(req: AuthenticatedRequest, res: Response) {
    try {
        const { id } = req.params;
        const userId = req.user!.role === 'ADMIN' ? undefined : req.user!.id;

        const order = await orderService.cancelOrder(id, userId);

        // Buscar dados completos da ordem para notificação
        const fullOrder = await orderService.getOrderById(id);

        await sendTelegramMessage(
            `❌ <b>Encomenda Cancelada</b>\n\n` +
            `📦 <b>Encomenda:</b> #${order.id}\n` +
            `📧 <b>Cliente:</b> ${fullOrder.user.email}\n` +
            `💰 <b>Valor:</b> €${parseFloat(order.total.toString()).toFixed(2)}\n` +
            `👤 <b>Cancelado por:</b> ${req.user!.role === 'ADMIN' ? 'Admin' : 'Cliente'}\n` +
            `⏰ <b>Data:</b> ${new Date().toLocaleString('pt-PT')}`
        );

        res.json({ message: 'Encomenda cancelada com sucesso', order });
    } catch (error: any) {
        if (error.message === 'order.not_found') {
            return res.status(404).json({ error: 'Encomenda não encontrada' });
        }
        if (error.message === 'order.unauthorized') {
            return res.status(403).json({ error: 'Não autorizado a cancelar esta encomenda' });
        }
        if (error.message === 'order.cannot_cancel') {
            return res.status(400).json({ error: 'Esta encomenda não pode ser cancelada' });
        }
        res.status(500).json({ error: error.message });
    }
}

export async function getOrderStats(req: Request, res: Response) {
    try {
        const stats = await orderService.getOrderStats();
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}