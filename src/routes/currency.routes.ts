import { Router } from 'express';
import { convertPrice } from '../controllers/currency.controller';

const router = Router();

/**
 * @openapi
 * /currency/convert:
 *   get:
 *     summary: Converter preço entre moedas (EUR/USD/BRL)
 *     tags:
 *       - Currency
 *     parameters:
 *       - in: query
 *         name: amount
 *         schema:
 *           type: number
 *         required: true
 *         description: Valor a converter
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *         required: true
 *         description: Moeda de origem (EUR, USD, BRL)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *         required: true
 *         description: Moeda de destino (EUR, USD, BRL)
 *     responses:
 *       200:
 *         description: Valor convertido e taxa de câmbio
 *       400:
 *         description: Parâmetros em falta ou inválidos
 */
router.get('/convert', convertPrice);

export default router;