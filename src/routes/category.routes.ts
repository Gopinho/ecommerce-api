import { Router } from 'express';
import { createCategory, getAllCategories, updateCategory, deleteCategory } from '../controllers/category.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

/**
 * @openapi
 * /categories:
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
 *                 example: "Eletrónica"
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
 * /categories/{id}:
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
 *                 example: "Livros"
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
 * /categories/{id}:
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
 * /categories:
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