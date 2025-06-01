import { Router } from 'express';
import { register, login, refreshToken, logoutUser, requestPasswordReset, resetPassword, getMe, changeEmail } from '../controllers/auth.controller';
import { setup2FA, confirm2FA, disable2FA } from '../controllers/2fa.controller';
import { authenticate } from '../middlewares/authenticate';
import { authLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Registo de utilizador
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilizador registado
 *       400:
 *         description: Dados inválidos
 */
router.post('/register', authLimiter, register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login de utilizador
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', authLimiter, login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Atualização de token
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Token atualizado com sucesso
 *       401:
 *         description: Token inválido ou expirado
 */
router.post('/refresh', refreshToken);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout de utilizador
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logout bem-sucedido
 */
router.post('/logout', logoutUser);

/**
 * @openapi
 * /auth/2fa/setup:
 *   post:
 *     summary: Configuração de 2FA
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA configurado com sucesso
 *       401:
 *         description: Não autenticado (token JWT obrigatório)
 */ 
router.post('/2fa/setup', authenticate, setup2FA);

/**
 * @openapi
 * /auth/2fa/verify:
 *   post:
 *     summary: Verificação de 2FA
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA verificado com sucesso
 *       401:
 *         description: Não autenticado (token JWT obrigatório)
 */ 
router.post('/2fa/verify', authenticate, confirm2FA);

/**
 * @openapi
 * /auth/2fa/disable:
 *   post:
 *     summary: Desativação de 2FA
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA desativado com sucesso
 *       401:
 *         description: Não autenticado (token JWT obrigatório)
 */
router.post('/2fa/disable', authenticate, disable2FA);

/**
 * @openapi
 * /auth/request-password-reset:
 *   post:
 *     summary: Solicitação de redefinição de senha
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email enviado para redefinição de senha
 */
router.post('/request-password-reset', requestPasswordReset);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Redefinição de senha
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 */
router.post('/reset-password', resetPassword);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Obter perfil do utilizador autenticado
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do utilizador
 *       401:
 *         description: Não autenticado (token JWT obrigatório)
 */
router.get('/me', authenticate, getMe);

/**
 * @openapi
 * /auth/change-email:
 *   post:
 *     summary: Alterar email do utilizador autenticado
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newEmail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email alterado com sucesso
 *       400:
 *         description: Novo email é obrigatório
 *       409:
 *         description: Email já está em uso
 *       401:
 *         description: Não autenticado (token JWT obrigatório)
 */
router.post('/change-email', authenticate, changeEmail);

export default router;
