import axios from 'axios';
import 'dotenv/config';

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
const TELEGRAM_ERROR_CHAT_ID = process.env.TELEGRAM_ERROR_CHAT_ID!;

interface OrderNotification {
    orderId: string;
    userId: string;
    userEmail: string;
    total: number;
    items: Array<{
        productName: string;
        quantity: number;
        price: number;
    }>;
    paymentMethod?: string;
    shippingAddress?: string;
}

interface ErrorNotification {
    type: 'server_error' | 'client_error';
    message: string;
    stack?: string;
    endpoint?: string;
    userId?: string;
    timestamp: Date;
    userAgent?: string;
    ip?: string;
}

// Função principal para enviar mensagens
export async function sendTelegramMessage(message: string, chatId?: string) {
    const targetChatId = chatId || TELEGRAM_CHAT_ID;

    if (!TELEGRAM_TOKEN || !targetChatId) {
        console.log('Telegram config missing');
        return;
    }

    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: targetChatId,
            text: message,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });
        console.log(`Telegram message sent to ${targetChatId}`);
    } catch (err) {
        console.error('Telegram error:', err);
    }
}

// Notificação de nova encomenda
export async function sendOrderNotification(order: OrderNotification) {
    const itemsList = order.items
        .map(item => `  • ${item.productName} x${item.quantity} - €${item.price.toFixed(2)}`)
        .join('\n');

    const message = `
🛒 <b>NOVA ENCOMENDA!</b>

📧 <b>Cliente:</b> ${order.userEmail}
🆔 <b>Pedido:</b> #${order.orderId}
💰 <b>Total:</b> €${order.total.toFixed(2)}

📦 <b>Itens:</b>
${itemsList}

${order.paymentMethod ? `💳 <b>Pagamento:</b> ${order.paymentMethod}` : ''}
${order.shippingAddress ? `📍 <b>Envio:</b> ${order.shippingAddress}` : ''}

⏰ <b>Data:</b> ${new Date().toLocaleString('pt-PT')}
    `.trim();

    await sendTelegramMessage(message, TELEGRAM_CHAT_ID);
}

// Notificação de erro do servidor
export async function sendErrorNotification(error: ErrorNotification) {
    let message = '';

    if (error.type === 'server_error') {
        // Erros internos do servidor
        message = `
🚨 <b>ERRO DO SERVIDOR</b>

⚠️ <b>Tipo:</b> Erro Interno
📝 <b>Mensagem:</b> ${error.message}
🌐 <b>Endpoint:</b> ${error.endpoint || 'N/A'}
👤 <b>Usuário:</b> ${error.userId || 'Anônimo'}
🌍 <b>IP:</b> ${error.ip || 'N/A'}
📱 <b>User-Agent:</b> ${error.userAgent?.substring(0, 100) || 'N/A'}...
⏰ <b>Timestamp:</b> ${error.timestamp.toLocaleString('pt-PT')}

${error.stack ? `📋 <b>Stack:</b>\n<code>${error.stack.substring(0, 500)}...</code>` : ''}
        `.trim();

        await sendTelegramMessage(message, TELEGRAM_ERROR_CHAT_ID);
    } else if (error.type === 'client_error') {
        // Erros por culpa do cliente (apenas log, não enviar para Telegram)
        console.log(`Client Error: ${error.message} - User: ${error.userId} - Endpoint: ${error.endpoint}`);
    }
}

// Notificação de teste do sistema
export async function sendSystemTestNotification() {
    const message = `
✅ <b>TESTE DO SISTEMA</b>

🔧 Sistema de notificações funcionando corretamente
⏰ ${new Date().toLocaleString('pt-PT')}
📊 Servidor: Online
🚀 API: Operacional
    `.trim();

    await sendTelegramMessage(message, TELEGRAM_CHAT_ID);
}

// Função para categorizar erro
export function categorizeError(error: any, req?: any): 'server_error' | 'client_error' {
    // Erros de cliente (4xx)
    const clientErrors = [
        'validation failed',
        'invalid credentials',
        'unauthorized',
        'forbidden',
        'not found',
        'bad request',
        'invalid token',
        'expired token',
        'wrong password',
        'email already exists',
        'user not found',
        'insufficient permissions',
        'invalid email format',
        'password too weak'
    ];

    const errorMessage = error.message?.toLowerCase() || '';
    const statusCode = error.statusCode || error.status || 500;

    // Se é erro 4xx ou contém palavras de erro de cliente
    if (statusCode >= 400 && statusCode < 500) {
        return 'client_error';
    }

    // Verificar se a mensagem contém indicadores de erro de cliente
    if (clientErrors.some(clientError => errorMessage.includes(clientError))) {
        return 'client_error';
    }

    // Caso contrário, é erro do servidor
    return 'server_error';
}