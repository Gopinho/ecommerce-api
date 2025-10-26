import { Router } from 'express';
import {
    createOrder,
    getAllOrders,
    getOrderById,
    getUserOrders,
    updateOrderStatus,
    cancelOrder,
    getOrderStats
} from '../controllers/order.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

/**
 * @openapi
 * /orders/my:
 *   get:
 *     summary: Obter encomendas do utilizador autenticado
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista das encomendas do utilizador
 *       401:
 *         description: Não autenticado
 */
router.get('/my', authenticate, getUserOrders);

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Criar nova encomenda
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     variantId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *               couponId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Encomenda criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
router.post('/', authenticate, createOrder);

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Listar todas as encomendas (Admin)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PAID, SHIPPED, CANCELLED]
 *     responses:
 *       200:
 *         description: Lista de todas as encomendas
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.get('/', authenticate, authorizeRole('ADMIN'), getAllOrders);

/**
 * @openapi
 * /orders/stats:
 *   get:
 *     summary: Obter estatísticas das encomendas (Admin)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas das encomendas
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.get('/stats', authenticate, authorizeRole('ADMIN'), getOrderStats);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Obter encomenda por ID
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalhes da encomenda
 *       404:
 *         description: Encomenda não encontrada
 *       401:
 *         description: Não autenticado
 */
router.get('/:id', authenticate, getOrderById);

/**
 * @openapi
 * /orders/{id}/status:
 *   put:
 *     summary: Atualizar status da encomenda (Admin)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PAID, SHIPPED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status da encomenda atualizado
 *       400:
 *         description: Status inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.put('/:id/status', authenticate, authorizeRole('ADMIN'), updateOrderStatus);

/**
 * @openapi
 * /orders/{id}/cancel:
 *   post:
 *     summary: Cancelar encomenda
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Encomenda cancelada
 *       400:
 *         description: Encomenda não pode ser cancelada
 *       403:
 *         description: Não autorizado
 *       404:
 *         description: Encomenda não encontrada
 */
router.post('/:id/cancel', authenticate, cancelOrder);

export default router;