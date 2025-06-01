import { Router } from 'express';
import { createOrUpdate, getByProduct, getAverage, remove, getByUser } from '../controllers/review.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

/**
 * @openapi
 * /reviews/user/{userId}:
 *   get:
 *     summary: Obter avaliações por ID do usuário
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Avaliações obtidas com sucesso
 */
router.get('/user/:userId', authenticate, authorizeRole('ADMIN'), getByUser);

/**
 * @openapi
 * /reviews/{productId}:
 *   get:
 *     summary: Obter avaliações por ID do produto
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Avaliações obtidas com sucesso
 *       404:
 *         description: Produto não encontrado
 */
router.get('/:productId', getByProduct);

/**
 * @openapi
 * /reviews/{productId}/average:
 *   get:
 *     summary: Obter média de avaliações por ID do produto
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Média de avaliações obtida com sucesso
 */
router.get('/:productId/average', getAverage);

/**
 * @openapi
 * /reviews/{productId}:
 *   post:
 *     summary: Criar ou atualizar avaliação para um produto
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Avaliação criada ou atualizada com sucesso
 */
router.post('/:productId', authMiddleware, createOrUpdate);

/**
 * @openapi
 * /reviews/{productId}:
 *   delete:
 *     summary: Remover avaliação por ID do produto
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Avaliação removida com sucesso
 */
router.delete('/:productId', authMiddleware, remove);

export default router;
