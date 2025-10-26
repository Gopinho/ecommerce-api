import { Router } from 'express';
import {
    createSupplierController,
    getAllSuppliersController,
    getSupplierByIdController,
    updateSupplierController,
    deleteSupplierController,
    getSupplierStatsController,
    toggleSupplierStatusController
} from '../controllers/supplier.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

/**
 * @openapi
 * /suppliers:
 *   get:
 *     summary: Listar todos os fornecedores
 *     tags:
 *       - Suppliers
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de fornecedores
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.get('/', authenticate, authorizeRole('ADMIN'), getAllSuppliersController);

/**
 * @openapi
 * /suppliers:
 *   post:
 *     summary: Criar novo fornecedor (Admin)
 *     tags:
 *       - Suppliers
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
 *               contactName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               taxNumber:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: uri
 *               notes:
 *                 type: string
 *               paymentTerms:
 *                 type: string
 *               currency:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 3
 *     responses:
 *       201:
 *         description: Fornecedor criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.post('/', authenticate, authorizeRole('ADMIN'), createSupplierController);

/**
 * @openapi
 * /suppliers/stats:
 *   get:
 *     summary: Obter estatísticas dos fornecedores (Admin)
 *     tags:
 *       - Suppliers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas dos fornecedores
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.get('/stats', authenticate, authorizeRole('ADMIN'), getSupplierStatsController);

/**
 * @openapi
 * /suppliers/{id}:
 *   get:
 *     summary: Obter fornecedor por ID
 *     tags:
 *       - Suppliers
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
 *         description: Detalhes do fornecedor
 *       404:
 *         description: Fornecedor não encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.get('/:id', authenticate, authorizeRole('ADMIN'), getSupplierByIdController);

/**
 * @openapi
 * /suppliers/{id}:
 *   put:
 *     summary: Atualizar fornecedor (Admin)
 *     tags:
 *       - Suppliers
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
 *               contactName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               taxNumber:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: uri
 *               notes:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               paymentTerms:
 *                 type: string
 *               currency:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 3
 *     responses:
 *       200:
 *         description: Fornecedor atualizado
 *       404:
 *         description: Fornecedor não encontrado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.put('/:id', authenticate, authorizeRole('ADMIN'), updateSupplierController);

/**
 * @openapi
 * /suppliers/{id}:
 *   delete:
 *     summary: Deletar fornecedor (Admin)
 *     tags:
 *       - Suppliers
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
 *         description: Fornecedor deletado
 *       404:
 *         description: Fornecedor não encontrado
 *       400:
 *         description: Fornecedor tem encomendas ativas
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.delete('/:id', authenticate, authorizeRole('ADMIN'), deleteSupplierController);

/**
 * @openapi
 * /suppliers/{id}/toggle-status:
 *   post:
 *     summary: Alternar status do fornecedor (Admin)
 *     tags:
 *       - Suppliers
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
 *         description: Fornecedor não encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (apenas Admin)
 */
router.post('/:id/toggle-status', authenticate, authorizeRole('ADMIN'), toggleSupplierStatusController);

export default router;