import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from '../controllers/cart.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /cart:
 *   get:
 *     summary: Obter o carrinho de compras
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrinho de compras obtido com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/', getCart);

/**
 * @openapi
 * /cart:
 *   post:
 *     summary: Adicionar item ao carrinho de compras
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "clx123"
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Item adicionado ao carrinho com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', addToCart);

/**
 * @openapi
 * /cart/{id}:
 *   put:
 *     summary: Atualizar item no carrinho de compras
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do item no carrinho a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.put('/:id', updateCartItem);

/**
 * @openapi
 * /cart/{id}:
 *   delete:
 *     summary: Remover item do carrinho de compras
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do item no carrinho a ser removido
 *     responses:
 *       204:
 *         description: Item removido com sucesso
 *       404:
 *         description: Item não encontrado
 */
router.delete('/:id', removeCartItem);

export default router;