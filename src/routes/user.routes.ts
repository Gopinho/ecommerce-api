import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { exportUserData } from '../controllers/user.controller';

const router = Router();

/**
 * @openapi
 * /user/export:
 *   get:
 *     summary: Exportar todos os dados do utilizador autenticado (GDPR)
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados exportados em JSON
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 id: "clx123"
 *                 email: "user@email.com"
 *                 name: "Utilizador Exemplo"
 *                 licenses: []
 *                 orders: []
 *                 auditLogs: []
 *                 reviews: []
 *                 wishlist: []
 *       401:
 *         description: Não autenticado (token JWT obrigatório)
 */
router.get('/export', authenticate, exportUserData);

export default router;