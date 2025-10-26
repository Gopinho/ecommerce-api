import { Router } from 'express';
import { getMetrics, getMetricsJson } from '../controllers/metrics.controller';

const router = Router();

/**
 * @openapi
 * /metrics:
 *   get:
 *     summary: Métricas do sistema (formato Prometheus)
 *     tags:
 *       - Metrics
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         description: Token de acesso (obrigatório em produção)
 *     responses:
 *       200:
 *         description: Métricas em formato Prometheus
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       401:
 *         description: Token obrigatório em produção
 */
router.get('/', getMetrics);

/**
 * @openapi
 * /metrics/json:
 *   get:
 *     summary: Métricas do sistema (formato JSON)
 *     tags:
 *       - Metrics
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         description: Token de acesso (obrigatório em produção)
 *     responses:
 *       200:
 *         description: Métricas em formato JSON
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests_total:
 *                   type: number
 *                 uptime:
 *                   type: number
 *                 memory_usage:
 *                   type: object
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     avg_response_time_ms:
 *                       type: number
 *                     requests_per_minute:
 *                       type: number
 *                     status_codes:
 *                       type: object
 *       401:
 *         description: Token obrigatório em produção
 */
router.get('/json', getMetricsJson);

export default router;