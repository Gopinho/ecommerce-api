import { Router } from 'express';
import {
    createSupplierOrderController,
    getAllSupplierOrdersController,
    getSupplierOrderByIdController,
    updateSupplierOrderController,
    updateSupplierOrderItemController,
    deleteSupplierOrderController,
    getSupplierOrderStatsController,
    markOrderAsSentController,
    markOrderAsReceivedController
} from '../controllers/supplierOrder.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

/**
 * @openapi
 * /supplier-orders:
 *   get:
 *     summary: Listar todas as encomendas de fornecedores
 *     tags:
 *       - Supplier Orders
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
 *           enum: [PENDENTE, ENVIADA, RECEBIDA, CANCELADA]
 *       - in: query
 *         name: supplierId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de encomendas
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.get('/', authenticate, authorizeRole('ADMIN'), getAllSupplierOrdersController);

/**
 * @openapi
 * /supplier-orders:
 *   post:
 *     summary: Criar nova encomenda de fornecedor (Admin)
 *     tags:
 *       - Supplier Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplierId
 *               - items
 *             properties:
 *               supplierId:
 *                 type: string
 *               orderNumber:
 *                 type: string
 *               expectedDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *               currency:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 3
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - productName
 *                     - quantity
 *                     - unitPrice
 *                   properties:
 *                     productId:
 *                       type: string
 *                     productName:
 *                       type: string
 *                     description:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                     unitPrice:
 *                       type: number
 *                       minimum: 0
 *                     sku:
 *                       type: string
 *     responses:
 *       201:
 *         description: Encomenda criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Fornecedor não encontrado
 *       409:
 *         description: Número da encomenda já existe
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.post('/', authenticate, authorizeRole('ADMIN'), createSupplierOrderController);

/**
 * @openapi
 * /supplier-orders/stats:
 *   get:
 *     summary: Obter estatísticas das encomendas (Admin)
 *     tags:
 *       - Supplier Orders
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
router.get('/stats', authenticate, authorizeRole('ADMIN'), getSupplierOrderStatsController);

/**
 * @openapi
 * /supplier-orders/{id}:
 *   get:
 *     summary: Obter encomenda por ID
 *     tags:
 *       - Supplier Orders
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
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.get('/:id', authenticate, authorizeRole('ADMIN'), getSupplierOrderByIdController);

/**
 * @openapi
 * /supplier-orders/{id}:
 *   put:
 *     summary: Atualizar encomenda (Admin)
 *     tags:
 *       - Supplier Orders
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
 *                 enum: [PENDENTE, ENVIADA, RECEBIDA, CANCELADA]
 *               expectedDate:
 *                 type: string
 *                 format: date-time
 *               receivedDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *               invoiceNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Encomenda atualizada
 *       404:
 *         description: Encomenda não encontrada
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.put('/:id', authenticate, authorizeRole('ADMIN'), updateSupplierOrderController);

/**
 * @openapi
 * /supplier-orders/{id}:
 *   delete:
 *     summary: Deletar encomenda (Admin)
 *     tags:
 *       - Supplier Orders
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
 *         description: Encomenda deletada
 *       404:
 *         description: Encomenda não encontrada
 *       400:
 *         description: Não é possível deletar encomenda que não está pendente
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.delete('/:id', authenticate, authorizeRole('ADMIN'), deleteSupplierOrderController);

/**
 * @openapi
 * /supplier-orders/{id}/mark-sent:
 *   post:
 *     summary: Marcar encomenda como enviada (Admin)
 *     tags:
 *       - Supplier Orders
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
 *         description: Encomenda marcada como enviada
 *       404:
 *         description: Encomenda não encontrada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.post('/:id/mark-sent', authenticate, authorizeRole('ADMIN'), markOrderAsSentController);

/**
 * @openapi
 * /supplier-orders/{id}/mark-received:
 *   post:
 *     summary: Marcar encomenda como recebida (Admin)
 *     tags:
 *       - Supplier Orders
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
 *         description: Encomenda marcada como recebida
 *       404:
 *         description: Encomenda não encontrada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.post('/:id/mark-received', authenticate, authorizeRole('ADMIN'), markOrderAsReceivedController);

/**
 * @openapi
 * /supplier-orders/{id}/items/{itemId}:
 *   put:
 *     summary: Atualizar item da encomenda (Admin)
 *     tags:
 *       - Supplier Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
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
 *               receivedQuantity:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Item atualizado
 *       404:
 *         description: Encomenda ou item não encontrado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.put('/:id/items/:itemId', authenticate, authorizeRole('ADMIN'), updateSupplierOrderItemController);

export default router;