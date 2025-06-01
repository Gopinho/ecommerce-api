import { Router } from 'express';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist, 
  moveWishlistItemToCart
} from '../controllers/wishlist.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /wishlist:
 *   get:
 *     summary: Obter lista de desejos do usuário
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de desejos obtida com sucesso
 *       401:
 *         description: Não autenticado
 */
router.get('/', getWishlist);

/**
 * @openapi
 * /wishlist:
 *   post:
 *     summary: Adicionar produto à lista de desejos
 *     tags:
 *       - Wishlist
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
 *     responses:
 *       201:
 *         description: Produto adicionado à lista de desejos com sucesso
 *       401:
 *         description: Não autenticado
 */
router.post('/', addToWishlist);

/**
 * @openapi
 * /wishlist/{productId}:
 *   delete:
 *     summary: Remover produto da lista de desejos
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do produto a ser removido da lista de desejos
 *     responses:
 *       200:
 *         description: Produto removido da lista de desejos com sucesso
 *       401:
 *         description: Não autenticado
 */
router.delete('/:productId', removeFromWishlist);

/**
 * @openapi
 * /wishlist/move-to-cart:
 *   post:
 *     summary: Mover item da lista de desejos para o carrinho
 *     tags:
 *       - Wishlist
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
 *     responses:
 *       200:
 *         description: Item movido para o carrinho com sucesso
 *       401:
 *         description: Não autenticado
 */
router.post('/move-to-cart', moveWishlistItemToCart);

export default router;
