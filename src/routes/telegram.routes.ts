import { Router } from 'express';
import {
    testTelegramSystem,
    testErrorNotification,
    testOrderNotification,
    sendCustomMessage,
    simulateClientError,
    simulateServerError
} from '../controllers/telegram.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

// Teste geral do sistema (apenas admins)
router.post('/test/system', authenticate, authorizeRole('ADMIN'), testTelegramSystem);

// Teste de notificação de erro (apenas admins)
router.post('/test/error', authenticate, authorizeRole('ADMIN'), testErrorNotification);

// Teste de notificação de encomenda (apenas admins)
router.post('/test/order', authenticate, authorizeRole('ADMIN'), testOrderNotification);

// Enviar mensagem personalizada (apenas admins)
router.post('/test/custom', authenticate, authorizeRole('ADMIN'), sendCustomMessage);

// Simular erros para testar o sistema de notificações (apenas admins)
router.post('/test/simulate/client-error', authenticate, authorizeRole('ADMIN'), simulateClientError);
router.post('/test/simulate/server-error', authenticate, authorizeRole('ADMIN'), simulateServerError);

export default router;