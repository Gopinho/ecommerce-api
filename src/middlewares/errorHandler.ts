import { Request, Response, NextFunction } from 'express';
import { sendTelegramMessage } from '../services/telegram.service';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log detalhado para debug
  console.error(err);

  // Mensagem internacionalizada se possível
  const message = req.__(err.message) || err.message || 'common.internal_error';

  // Status code apropriado
  const status = err.status || 500;

  // Envia o erro para o Telegram (erros 500)
  if (status >= 500) {
    const errorMsg = `
🚨 *Erro no servidor*
*Status*: ${status}
*Mensagem*: ${message}
*Path*: ${req.method} ${req.originalUrl}
*User*: ${req.user?.id || 'N/A'}
*Stack*: \`${err.stack || ''}\`
    `;
    // Não precisa de await, mas podes usar se quiseres garantir ordem
    sendTelegramMessage(errorMsg);
  }

  res.status(status).json({ error: message });
}