import { Router } from 'express';
import { listUserLicenses, renewLicense, revokeLicense, simulateAutoRenew } from '../controllers/license.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

/**
 * @openapi
 * /license:
 *   get:
 *     summary: Listar licenças do usuário
 *     tags:
 *       - Licenses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Licenças listadas com sucesso
 *       401:
 *         description: Não autenticado
 */
router.get('/', authenticate, listUserLicenses);

/**
 * @openapi
 * /license/renew:
 *   get:
 *     summary: Renovar licença
 *     tags:
 *       - Licenses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Licença renovada com sucesso
 *       401:
 *         description: Não autenticado
 */
router.get('/renew', authenticate, renewLicense);

/**
 * @openapi
 * /license/revoke:
 *   get:
 *     summary: Revogar licença
 *     tags:
 *       - Licenses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Licença revogada com sucesso
 *       401:
 *         description: Não autenticado
 */
router.get('/revoke', authenticate, revokeLicense);

/**
 * @openapi
 * /license/simulate-renew:
 *   post:
 *     summary: Simular renovação automática de licença
 *     tags:
 *       - Licenses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Simulação de renovação automática realizada com sucesso
 *       401:
 *         description: Não autenticado
 */
router.post('/simulate-renew', authenticate, simulateAutoRenew);

export default router;