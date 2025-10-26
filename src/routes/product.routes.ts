import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';
import { popularProducts } from '../controllers/product.controller';

const router = Router();

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Listar todos os produtos
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso
 */
router.get('/', getAllProducts);

/**
 * @openapi
 * /products/popular:
 *   get:
 *     summary: Listar produtos populares
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Lista de produtos populares retornada com sucesso
 */
router.get('/popular', popularProducts);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Obter produto por ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 */
router.get('/:id', getProductById);

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Criar novo produto
 *     tags:
 *       - Products
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
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 */
router.post('/', authenticate, authorizeRole('ADMIN'), createProduct);

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     summary: Atualizar produto por ID
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do produto a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 */
router.put('/:id', authenticate, authorizeRole('ADMIN'), updateProduct);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     summary: Deletar produto por ID
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do produto a ser deletado
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso
 */
router.delete('/:id', authenticate, authorizeRole('ADMIN'), deleteProduct);

export default router;
