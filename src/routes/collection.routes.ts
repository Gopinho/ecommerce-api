import { Router } from 'express';
import {
    createCollection,
    getAllCollections,
    getCollectionById,
    getCollectionBySlug,
    updateCollection,
    deleteCollection,
    addProductToCollection,
    removeProductFromCollection,
    getCollectionProducts,
    toggleCollectionFeatured,
    getCollectionStats,
    getFeaturedCollections
} from '../controllers/collection.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

/**
 * @openapi
 * /collections:
 *   get:
 *     summary: Listar todas as coleções
 *     tags:
 *       - Collections
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: season
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de coleções
 */
router.get('/', getAllCollections);

/**
 * @openapi
 * /collections/featured:
 *   get:
 *     summary: Obter coleções em destaque
 *     tags:
 *       - Collections
 *     responses:
 *       200:
 *         description: Coleções em destaque
 */
router.get('/featured', getFeaturedCollections);

/**
 * @openapi
 * /collections:
 *   post:
 *     summary: Criar nova coleção (Admin)
 *     tags:
 *       - Collections
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               season:
 *                 type: string
 *               year:
 *                 type: integer
 *               launchDate:
 *                 type: string
 *                 format: date-time
 *               coverImage:
 *                 type: string
 *               slug:
 *                 type: string
 *     responses:
 *       201:
 *         description: Coleção criada com sucesso
 *       400:
 *         description: Nome é obrigatório
 *       409:
 *         description: Coleção já existe
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.post('/', authenticate, authorizeRole('ADMIN'), createCollection);

/**
 * @openapi
 * /collections/stats:
 *   get:
 *     summary: Obter estatísticas das coleções (Admin)
 *     tags:
 *       - Collections
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas das coleções
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.get('/stats', authenticate, authorizeRole('ADMIN'), getCollectionStats);

/**
 * @openapi
 * /collections/slug/{slug}:
 *   get:
 *     summary: Obter coleção por slug
 *     tags:
 *       - Collections
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalhes da coleção
 *       404:
 *         description: Coleção não encontrada
 */
router.get('/slug/:slug', getCollectionBySlug);

/**
 * @openapi
 * /collections/{id}:
 *   get:
 *     summary: Obter coleção por ID
 *     tags:
 *       - Collections
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalhes da coleção
 *       404:
 *         description: Coleção não encontrada
 */
router.get('/:id', getCollectionById);

/**
 * @openapi
 * /collections/{id}:
 *   put:
 *     summary: Atualizar coleção (Admin)
 *     tags:
 *       - Collections
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               season:
 *                 type: string
 *               year:
 *                 type: integer
 *               launchDate:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *               coverImage:
 *                 type: string
 *               slug:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coleção atualizada
 *       404:
 *         description: Coleção não encontrada
 *       409:
 *         description: Nome ou slug já existe
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.put('/:id', authenticate, authorizeRole('ADMIN'), updateCollection);

/**
 * @openapi
 * /collections/{id}:
 *   delete:
 *     summary: Deletar coleção (Admin)
 *     tags:
 *       - Collections
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
 *         description: Coleção deletada
 *       404:
 *         description: Coleção não encontrada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.delete('/:id', authenticate, authorizeRole('ADMIN'), deleteCollection);

/**
 * @openapi
 * /collections/{id}/toggle-featured:
 *   post:
 *     summary: Alternar status de destaque da coleção (Admin)
 *     tags:
 *       - Collections
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
 *         description: Status alterado
 *       404:
 *         description: Coleção não encontrada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.post('/:id/toggle-featured', authenticate, authorizeRole('ADMIN'), toggleCollectionFeatured);

/**
 * @openapi
 * /collections/{id}/products:
 *   get:
 *     summary: Obter produtos da coleção
 *     tags:
 *       - Collections
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Produtos da coleção
 *       404:
 *         description: Coleção não encontrada
 */
router.get('/:id/products', getCollectionProducts);

/**
 * @openapi
 * /collections/{collectionId}/products:
 *   post:
 *     summary: Adicionar produto à coleção (Admin)
 *     tags:
 *       - Collections
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Produto adicionado à coleção
 *       404:
 *         description: Coleção ou produto não encontrado
 *       409:
 *         description: Produto já está na coleção
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.post('/:collectionId/products', authenticate, authorizeRole('ADMIN'), addProductToCollection);

/**
 * @openapi
 * /collections/{collectionId}/products/{productId}:
 *   delete:
 *     summary: Remover produto da coleção (Admin)
 *     tags:
 *       - Collections
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produto removido da coleção
 *       404:
 *         description: Produto não está na coleção
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.delete('/:collectionId/products/:productId', authenticate, authorizeRole('ADMIN'), removeProductFromCollection);

export default router;