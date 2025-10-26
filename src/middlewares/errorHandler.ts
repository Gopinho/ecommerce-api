import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    // Log detalhado para debug
    console.error('Error occurred:', err);

    // Mensagem internacionalizada se possível
    const message = req.__(err.message) || err.message || 'common.internal_error';

    // Status code apropriado
    const status = err.status || err.statusCode || 500;

    // Só enviar notificação Telegram em produção/desenvolvimento
    if (process.env.NODE_ENV !== 'test') {
        try {
            // Import dinâmico para evitar problemas em testes
            const { sendErrorNotification, categorizeError } = require('../services/telegram.service');

            // Categorizar o erro
            const errorType = categorizeError(err, req);

            // Enviar notificação Telegram
            sendErrorNotification({
                type: errorType,
                message: message,
                stack: err.stack,
                endpoint: `${req.method} ${req.originalUrl}`,
                userId: req.user?.id || req.body?.email || 'anonymous',
                timestamp: new Date(),
                userAgent: req.get('User-Agent'),
                ip: req.ip || req.connection.remoteAddress
            });
        } catch (telegramError) {
            console.error('Failed to send Telegram notification:', telegramError);
        }
    }

    // Resposta para o cliente
    res.status(status).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString()
    });
}