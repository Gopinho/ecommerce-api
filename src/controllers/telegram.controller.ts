import { Request, Response } from 'express';
import {
    sendTelegramMessage,
    sendSystemTestNotification,
    sendErrorNotification,
    sendOrderNotification
} from '../services/telegram.service';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
        email?: string;
        name?: string;
    };
}

// Teste geral do sistema Telegram
export async function testTelegramSystem(req: AuthenticatedRequest, res: Response) {
    try {
        await sendSystemTestNotification();
        res.json({
            success: true,
            message: 'Notificação de teste enviada com sucesso',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Teste de notificação de erro
export async function testErrorNotification(req: AuthenticatedRequest, res: Response) {
    try {
        const { type = 'server_error', message = 'Erro de teste' } = req.body;

        await sendErrorNotification({
            type: type as 'server_error' | 'client_error',
            message,
            stack: 'Stack trace de teste...',
            endpoint: `${req.method} ${req.originalUrl}`,
            userId: req.user?.id || 'test-user',
            timestamp: new Date(),
            userAgent: req.get('User-Agent'),
            ip: req.ip
        });

        res.json({
            success: true,
            message: `Notificação de erro (${type}) enviada com sucesso`,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Teste de notificação de encomenda
export async function testOrderNotification(req: AuthenticatedRequest, res: Response) {
    try {
        const mockOrder = {
            orderId: 'TEST-' + Date.now(),
            userId: req.user?.id || 'test-user',
            userEmail: req.user?.email || 'test@exemplo.com',
            total: 49.99,
            items: [
                {
                    productName: 'Produto de Teste 1',
                    quantity: 2,
                    price: 19.99
                },
                {
                    productName: 'Produto de Teste 2',
                    quantity: 1,
                    price: 9.99
                }
            ],
            paymentMethod: 'Cartão de Crédito',
            shippingAddress: 'Rua de Teste, 123, Lisboa, Portugal'
        };

        await sendOrderNotification(mockOrder);

        res.json({
            success: true,
            message: 'Notificação de encomenda de teste enviada com sucesso',
            mockOrder,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Enviar mensagem personalizada
export async function sendCustomMessage(req: AuthenticatedRequest, res: Response) {
    try {
        const { message, chatId } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Mensagem é obrigatória'
            });
        }

        await sendTelegramMessage(message, chatId);

        res.json({
            success: true,
            message: 'Mensagem personalizada enviada com sucesso',
            sentTo: chatId || 'chat padrão',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Simular erro do cliente
export async function simulateClientError(req: Request, res: Response) {
    const error = new Error('Credenciais inválidas');
    (error as any).status = 401;
    throw error;
}

// Simular erro do servidor
export async function simulateServerError(req: Request, res: Response) {
    const error = new Error('Falha interna na base de dados');
    (error as any).status = 500;
    throw error;
}