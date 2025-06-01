import { Router } from 'express';
import { getAuditLogs, userAuditLogs, userAuditLogsByAdmin } from '../controllers/audit.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

/**
 * @openapi
 * /admin/audit-logs:
 *   get:
 *     summary: Obter registos de auditoria
 *     tags:
 *       - Audit
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de registos de auditoria
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.get('/', authenticate, authorizeRole('ADMIN'), getAuditLogs);

/**
 * @openapi
 * /admin/audit-logs/user:
 *   get:
 *     summary: Listar logs de auditoria do utilizador autenticado
 *     tags:
 *       - Audit
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de logs de auditoria do utilizador
 *       401:
 *         description: Não autenticado (token JWT obrigatório)
 */
router.get('/user', authenticate, userAuditLogs);

/**
 * @openapi
 * /admin/audit-logs/user/{userId}:
 *   get:
 *     summary: Listar logs de auditoria de um utilizador (admin)
 *     tags:
 *       - Audit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do utilizador
 *     responses:
 *       200:
 *         description: Lista de logs de auditoria do utilizador
 *       401:
 *         description: Não autenticado (token JWT obrigatório)
 *       403:
 *         description: Sem permissão (apenas admin)
 */
router.get('/user/:userId', authenticate, authorizeRole('ADMIN'), userAuditLogsByAdmin);

export default router;