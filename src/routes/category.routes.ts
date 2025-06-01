import { Router } from 'express';
import { createCategory, getAllCategories, updateCategory, deleteCategory } from '../controllers/category.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

/**
 * @openapi
 * /api/categories:
 *   post:
 *     summary: Criar nova categoria
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoria criada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post('/', authenticate, authorizeRole('ADMIN'), createCategory);

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     summary: Apagar categoria
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria apagada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Categoria não encontrada
 */
router.delete('/:id', authenticate, authorizeRole('ADMIN'), deleteCategory);

/**
 * @openapi
 * /api/categories/{id}:
 *   put:
 *     summary: Atualizar categoria
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoria atualizada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Categoria não encontrada
 */
router.put('/:id', authenticate, authorizeRole('ADMIN'), updateCategory);

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: Listar todas as categorias
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
router.get('/', getAllCategories);

export default router;