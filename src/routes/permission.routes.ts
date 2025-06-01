import { Router } from 'express';
import * as permissionController from '../controllers/permission.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

/**
 * @openapi
 * /admin/permissions:
 *   post:
 *     summary: Criar permissão
 *     tags:
 *       - Permissions
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
 *                 example: "EDIT_PRODUCTS"
 *     responses:
 *       201:
 *         description: Permissão criada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post('/admin/permissions', authenticate, authorizeRole('ADMIN'), permissionController.createPermission);

/**
 * @openapi
 * /admin/permissions:
 *   get:
 *     summary: Listar permissões
 *     tags:
 *       - Permissions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de permissões
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/admin/permissions', authenticate, authorizeRole('ADMIN'), permissionController.listPermissions);

/**
 * @openapi
 * /admin/groups:
 *   post:
 *     summary: Criar grupo de utilizadores
 *     tags:
 *       - Groups
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
 *                 example: "Admins"
 *     responses:
 *       201:
 *         description: Grupo criado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post('/admin/groups', authenticate, authorizeRole('ADMIN'), permissionController.createGroup);

/**
 * @openapi
 * /admin/groups:
 *   get:
 *     summary: Listar grupos de utilizadores
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de grupos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/admin/groups', authenticate, authorizeRole('ADMIN'), permissionController.listGroups);

/**
 * @openapi
 * /admin/permissions/add-to-user:
 *   post:
 *     summary: Associar permissão a utilizador
 *     tags:
 *       - Permissions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "clx123"
 *               permissionId:
 *                 type: string
 *                 example: "perm456"
 *     responses:
 *       200:
 *         description: Permissão associada ao utilizador
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post('/admin/permissions/add-to-user', authenticate, authorizeRole('ADMIN'), permissionController.addPermissionToUser);

/**
 * @openapi
 * /admin/groups/add-user:
 *   post:
 *     summary: Associar utilizador a grupo
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "clx123"
 *               groupId:
 *                 type: string
 *                 example: "group789"
 *     responses:
 *       200:
 *         description: Utilizador associado ao grupo
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post('/admin/groups/add-user', authenticate, authorizeRole('ADMIN'), permissionController.addUserToGroup);

export default router;