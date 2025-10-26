import { Request, Response } from 'express';
import * as analyticsService from './analytics.service';

// Interface para clientes conectados
interface SSEClient {
    id: string;
    response: Response;
    userId: string;
    lastPing: Date;
}

// Store para clientes conectados
const connectedClients = new Map<string, SSEClient>();

// Intervalo para limpeza de clientes desconectados
let cleanupInterval: NodeJS.Timeout;

/**
 * Inicializar o serviço SSE
 */
export function initializeSSE() {
    // Limpeza de clientes desconectados a cada 30 segundos
    cleanupInterval = setInterval(() => {
        const now = new Date();
        const timeout = 60000; // 1 minuto

        for (const [clientId, client] of connectedClients.entries()) {
            if (now.getTime() - client.lastPing.getTime() > timeout) {
                console.log(`🔌 Cliente SSE desconectado: ${clientId}`);
                connectedClients.delete(clientId);
            }
        }
    }, 30000);

    console.log('📡 Serviço SSE inicializado');
}

/**
 * Finalizar o serviço SSE
 */
export function finalizeSSE() {
    if (cleanupInterval) {
        clearInterval(cleanupInterval);
    }

    // Fechar todas as conexões
    for (const client of connectedClients.values()) {
        client.response.end();
    }

    connectedClients.clear();
    console.log('📡 Serviço SSE finalizado');
}

/**
 * Estabelecer conexão SSE para dashboard
 */
export function establishSSEConnection(req: Request, res: Response, userId: string) {
    const clientId = `${userId}_${Date.now()}`;

    // Configurar headers SSE
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Enviar confirmação de conexão
    res.write(`data: ${JSON.stringify({
        type: 'connection',
        message: 'Conectado ao dashboard em tempo real',
        clientId,
        timestamp: new Date().toISOString()
    })}\n\n`);

    // Adicionar cliente à lista
    connectedClients.set(clientId, {
        id: clientId,
        response: res,
        userId,
        lastPing: new Date()
    });

    console.log(`📡 Novo cliente SSE conectado: ${clientId} (Usuário: ${userId})`);

    // Lidar com desconexão
    req.on('close', () => {
        console.log(`🔌 Cliente SSE desconectado: ${clientId}`);
        connectedClients.delete(clientId);
    });

    // Manter conexão ativa (heartbeat)
    const heartbeat = setInterval(() => {
        if (connectedClients.has(clientId)) {
            const client = connectedClients.get(clientId)!;
            client.lastPing = new Date();

            try {
                res.write(`data: ${JSON.stringify({
                    type: 'heartbeat',
                    timestamp: new Date().toISOString()
                })}\n\n`);
            } catch (error) {
                console.log(`❌ Erro no heartbeat para cliente ${clientId}:`, error);
                connectedClients.delete(clientId);
                clearInterval(heartbeat);
            }
        } else {
            clearInterval(heartbeat);
        }
    }, 30000); // A cada 30 segundos
}

/**
 * Enviar atualizações para todos os clientes conectados
 */
export async function broadcastDashboardUpdate(updateType: string, data?: any) {
    if (connectedClients.size === 0) {
        return; // Nenhum cliente conectado
    }

    let updateData = data;

    // Se não fornecer dados específicos, buscar automaticamente
    if (!updateData) {
        try {
            switch (updateType) {
                case 'metrics':
                    updateData = await getQuickMetrics();
                    break;
                case 'orders':
                    updateData = await analyticsService.getRecentOrders();
                    break;
                case 'sales':
                    updateData = await analyticsService.getMonthlySalesData();
                    break;
                default:
                    updateData = { message: 'Atualização geral' };
            }
        } catch (error) {
            console.error('❌ Erro ao buscar dados para broadcast:', error);
            updateData = { error: 'Erro ao buscar dados' };
        }
    }

    const message = {
        type: updateType,
        data: updateData,
        timestamp: new Date().toISOString()
    };

    const messageString = `data: ${JSON.stringify(message)}\n\n`;
    const clientsToRemove: string[] = [];

    // Enviar para todos os clientes
    for (const [clientId, client] of connectedClients.entries()) {
        try {
            client.response.write(messageString);
        } catch (error) {
            console.log(`❌ Erro ao enviar para cliente ${clientId}:`, error);
            clientsToRemove.push(clientId);
        }
    }

    // Remover clientes com erro
    clientsToRemove.forEach(clientId => {
        connectedClients.delete(clientId);
    });

    console.log(`📡 Broadcast enviado para ${connectedClients.size} clientes: ${updateType}`);
}

/**
 * Obter métricas rápidas para atualizações
 */
async function getQuickMetrics() {
    try {
        const [salesMetrics, dashboardMetrics, orderMetrics] = await Promise.all([
            analyticsService.getSalesMetrics(),
            analyticsService.getDashboardMetrics(),
            analyticsService.getOrderMetrics()
        ]);

        return {
            sales: salesMetrics,
            dashboard: dashboardMetrics,
            orders: orderMetrics,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Erro ao obter métricas rápidas:', error);
        return { error: 'Erro ao obter métricas' };
    }
}

/**
 * Agendar atualizações automáticas
 */
export function scheduleAutomaticUpdates() {
    // Atualizar métricas a cada 5 minutos
    setInterval(async () => {
        await broadcastDashboardUpdate('metrics');
    }, 5 * 60 * 1000);

    // Atualizar encomendas recentes a cada 2 minutos
    setInterval(async () => {
        await broadcastDashboardUpdate('orders');
    }, 2 * 60 * 1000);

    // Atualizar vendas mensais uma vez por hora
    setInterval(async () => {
        await broadcastDashboardUpdate('sales');
    }, 60 * 60 * 1000);

    console.log('⏰ Atualizações automáticas agendadas');
}

/**
 * Obter estatísticas dos clientes conectados
 */
export function getSSEStats() {
    const clients = Array.from(connectedClients.values());

    return {
        totalClients: clients.length,
        clients: clients.map(client => ({
            id: client.id,
            userId: client.userId,
            connectedSince: client.lastPing,
            minutesConnected: Math.floor((Date.now() - client.lastPing.getTime()) / 60000)
        }))
    };
}