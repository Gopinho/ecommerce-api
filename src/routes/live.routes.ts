import { Router } from 'express';
import * as liveController from '../controllers/live.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

// Middleware: Todas as rotas live requerem autenticação de administrador
router.use(authenticate);
router.use(authorizeRole('ADMIN'));

/**
 * @swagger
 * components:
 *   schemas:
 *     SSEStats:
 *       type: object
 *       properties:
 *         totalClients:
 *           type: integer
 *           description: Número total de clientes conectados
 *         clients:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID único da conexão
 *               userId:
 *                 type: string
 *                 description: ID do utilizador
 *               connectedSince:
 *                 type: string
 *                 format: date-time
 *                 description: Quando se conectou
 *               minutesConnected:
 *                 type: integer
 *                 description: Minutos conectado
 */

/**
 * @swagger
 * /dashboard/live:
 *   get:
 *     tags: [Dashboard - Live Updates]
 *     summary: Estabelecer conexão SSE para atualizações em tempo real (Admin)
 *     description: |
 *       Estabelece uma conexão Server-Sent Events (SSE) para receber atualizações automáticas da dashboard.
 *       
 *       **Como usar:**
 *       ```javascript
 *       const eventSource = new EventSource('/dashboard/live', {
 *         headers: { 'Authorization': 'Bearer ' + token }
 *       });
 *       
 *       eventSource.onmessage = function(event) {
 *         const data = JSON.parse(event.data);
 *         console.log('Atualização recebida:', data);
 *       };
 *       ```
 *       
 *       **Tipos de eventos recebidos:**
 *       - `connection`: Confirmação de conexão
 *       - `heartbeat`: Manter conexão ativa
 *       - `metrics`: Métricas atualizadas
 *       - `orders`: Encomendas atualizadas
 *       - `sales`: Vendas atualizadas
 *       - `test`: Mensagens de teste
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conexão SSE estabelecida com sucesso
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: |
 *                 data: {"type":"connection","message":"Conectado ao dashboard em tempo real","clientId":"user123_1635123456789","timestamp":"2025-10-25T23:45:00.000Z"}
 *                 
 *                 data: {"type":"metrics","data":{"sales":{"totalSold":15000,"monthlyGrowth":12.5},"dashboard":{"totalClients":150}},"timestamp":"2025-10-25T23:45:30.000Z"}
 *       403:
 *         description: Não autorizado (apenas administradores)
 */
router.get('/', liveController.establishLiveConnection);

/**
 * @swagger
 * /dashboard/live/update:
 *   post:
 *     tags: [Dashboard - Live Updates]
 *     summary: Forçar atualização manual para todos os clientes conectados (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [metrics, orders, sales, all]
 *                 description: Tipo de atualização a enviar
 *             example:
 *               type: "metrics"
 *     responses:
 *       200:
 *         description: Atualização enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Tipo de atualização inválido
 */
router.post('/update', liveController.forceUpdate);

/**
 * @swagger
 * /dashboard/live/stats:
 *   get:
 *     tags: [Dashboard - Live Updates]
 *     summary: Obter estatísticas das conexões SSE ativas (Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas das conexões SSE
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SSEStats'
 */
router.get('/stats', liveController.getLiveStats);

/**
 * @swagger
 * /dashboard/live/test:
 *   post:
 *     tags: [Dashboard - Live Updates]
 *     summary: Enviar mensagem de teste para todos os clientes conectados (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Mensagem personalizada de teste
 *             example:
 *               message: "Teste de conexão da dashboard"
 *     responses:
 *       200:
 *         description: Mensagem de teste enviada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/test', liveController.testSSE);

export default router;