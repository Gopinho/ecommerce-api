import { Router } from 'express';
import * as stockController from '../controllers/stock.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     StockUpdate:
 *       type: object
 *       properties:
 *         realStock:
 *           type: integer
 *           minimum: 0
 *           description: Stock físico real disponível
 *         fictionalStock:
 *           type: integer
 *           minimum: 0
 *           description: Stock fictício/planejado para a coleção
 *       example:
 *         realStock: 50
 *         fictionalStock: 100
 *     
 *     StockInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID do produto
 *         name:
 *           type: string
 *           description: Nome do produto
 *         realStock:
 *           type: integer
 *           description: Stock físico real
 *         fictionalStock:
 *           type: integer
 *           description: Stock fictício/planejado
 *         stockDifference:
 *           type: integer
 *           description: Diferença entre stock fictício e real
 *         sold:
 *           type: integer
 *           description: Quantidade vendida
 */

/**
 * @swagger
 * /stock/{id}:
 *   get:
 *     tags: [Stock]
 *     summary: Obter informações de stock de um produto (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Informações de stock obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/StockInfo'
 *       404:
 *         description: Produto não encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado (apenas administradores)
 */
router.get('/:id', authenticate, authorizeRole('ADMIN'), stockController.getStock);

/**
 * @swagger
 * /stock/{id}:
 *   put:
 *     tags: [Stock]
 *     summary: Atualizar stock de um produto (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockUpdate'
 *     responses:
 *       200:
 *         description: Stock atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/StockInfo'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Produto não encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado (apenas administradores)
 */
router.put('/:id', authenticate, authorizeRole('ADMIN'), stockController.updateStock);

/**
 * @swagger
 * /stock/low-stock/products:
 *   get:
 *     tags: [Stock]
 *     summary: Obter produtos com stock baixo (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de stock considerado baixo
 *     responses:
 *       200:
 *         description: Lista de produtos com stock baixo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     threshold:
 *                       type: integer
 *                     count:
 *                       type: integer
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StockInfo'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado (apenas administradores)
 */
router.get('/low-stock/products', authenticate, authorizeRole('ADMIN'), stockController.getLowStock);

/**
 * @swagger
 * /stock/statistics/overview:
 *   get:
 *     tags: [Stock]
 *     summary: Obter estatísticas gerais de stock (Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas de stock
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalProducts:
 *                       type: integer
 *                     productsInStock:
 *                       type: integer
 *                     productsOutOfStock:
 *                       type: integer
 *                     totalRealStock:
 *                       type: integer
 *                     totalFictionalStock:
 *                       type: integer
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado (apenas administradores)
 */
router.get('/statistics/overview', authenticate, authorizeRole('ADMIN'), stockController.getStockStatistics);

export default router;