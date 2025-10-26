import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authenticate';
import * as sseService from '../services/sse.service';

/**
 * Estabelecer conexão SSE para dashboard em tempo real
 * GET /dashboard/live
 */
export async function establishLiveConnection(req: AuthenticatedRequest, res: Response) {
    try {
        const userId = req.user!.id;
        const userRole = req.user!.role;

        // Verificar se é administrador
        if (userRole !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Apenas administradores podem conectar ao dashboard em tempo real.'
            });
        }

        // Estabelecer conexão SSE
        sseService.establishSSEConnection(req, res, userId);

    } catch (error: any) {
        console.error('❌ Erro ao estabelecer conexão SSE:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * Forçar atualização manual
 * POST /dashboard/live/update
 */
export async function forceUpdate(req: AuthenticatedRequest, res: Response) {
    try {
        const { type } = req.body;
        const validTypes = ['metrics', 'orders', 'sales', 'all'];

        if (!type || !validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de atualização inválido. Use: metrics, orders, sales ou all'
            });
        }

        if (type === 'all') {
            // Enviar todas as atualizações
            await Promise.all([
                sseService.broadcastDashboardUpdate('metrics'),
                sseService.broadcastDashboardUpdate('orders'),
                sseService.broadcastDashboardUpdate('sales')
            ]);
        } else {
            await sseService.broadcastDashboardUpdate(type);
        }

        res.status(200).json({
            success: true,
            message: `Atualização ${type} enviada para todos os clientes conectados`
        });

    } catch (error: any) {
        console.error('❌ Erro ao forçar atualização:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * Obter estatísticas das conexões SSE
 * GET /dashboard/live/stats
 */
export async function getLiveStats(req: AuthenticatedRequest, res: Response) {
    try {
        const stats = sseService.getSSEStats();

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error: any) {
        console.error('❌ Erro ao obter estatísticas SSE:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * Testar conexão SSE (endpoint de demonstração)
 * POST /dashboard/live/test
 */
export async function testSSE(req: AuthenticatedRequest, res: Response) {
    try {
        const { message } = req.body;

        await sseService.broadcastDashboardUpdate('test', {
            message: message || 'Teste de conexão SSE',
            sentBy: req.user!.email,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({
            success: true,
            message: 'Mensagem de teste enviada para todos os clientes conectados'
        });

    } catch (error: any) {
        console.error('❌ Erro ao testar SSE:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
}