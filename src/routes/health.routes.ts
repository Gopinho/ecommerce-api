import { Router } from 'express';
import { healthCheck, simpleHealthCheck } from '../controllers/health.controller';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check detalhado do sistema
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Sistema saudável
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, unhealthy]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 version:
 *                   type: string
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [connected, disconnected]
 *                         responseTime:
 *                           type: number
 *                     redis:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [connected, disconnected]
 *                         responseTime:
 *                           type: number
 *                 memory:
 *                   type: object
 *                   properties:
 *                     used:
 *                       type: number
 *                     total:
 *                       type: number
 *                     percentage:
 *                       type: number
 *       503:
 *         description: Sistema com problemas
 */
router.get('/', healthCheck);

/**
 * @openapi
 * /health/simple:
 *   get:
 *     summary: Health check simples para load balancers
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Sistema funcionando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *       503:
 *         description: Sistema com problemas
 */
router.get('/simple', simpleHealthCheck);

export default router;