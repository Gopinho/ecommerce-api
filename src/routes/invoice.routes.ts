import { Router } from 'express';
import { downloadInvoice, downloadAllUserFiles } from '../controllers/invoice.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// Esta rota deve vir ANTES da rota /:id para evitar conflito
/**
 * @openapi
 * /invoices/download/all:
 *   get:
 *     summary: Baixar todas as faturas do utilizador autenticado
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas as faturas baixadas com sucesso
 *       401:
 *         description: Não autenticado
 */
router.get('/download/all', authenticate, downloadAllUserFiles);

/**
 * @openapi
 * /invoices/{id}:
 *   get:
 *     summary: Baixar fatura por ID
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da fatura
 *     responses:
 *       200:
 *         description: Fatura baixada com sucesso
 *       401:
 *         description: Não autenticado
 */
router.get('/:id', authenticate, downloadInvoice);

export default router;