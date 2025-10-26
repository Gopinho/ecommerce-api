// Mock do Redis para evitar tentativas de conexão durante os testes
jest.mock('../lib/redis', () => ({
    redis: {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        del: jest.fn().mockResolvedValue(1),
        on: jest.fn(),
        connect: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined),
        quit: jest.fn().mockResolvedValue(undefined),
    },
    isRedisConnected: false
}));

// Mock do Telegram para evitar envio de mensagens durante os testes
jest.mock('../services/telegram.service', () => ({
    sendOrderNotification: jest.fn().mockResolvedValue(undefined),
    sendErrorNotification: jest.fn().mockResolvedValue(undefined),
    sendTelegramMessage: jest.fn().mockResolvedValue(undefined),
}));

// Mock do nodemailer para evitar envio de emails durante os testes
jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
        verify: jest.fn().mockResolvedValue(true)
    }))
}));

// Mock do swagger-jsdoc para evitar problemas de ESM
jest.mock('swagger-jsdoc', () => {
    return jest.fn(() => ({
        openapi: '3.0.0',
        info: {
            title: 'Test API',
            version: '1.0.0'
        },
        paths: {}
    }));
});

// Mock do WebSocket para evitar problemas nos testes
jest.mock('ws', () => ({
    WebSocketServer: jest.fn(() => ({
        on: jest.fn(),
        close: jest.fn(),
    }))
}));

// Configuração global para testes
beforeAll(async () => {
    // Configurações globais se necessário
    process.env.NODE_ENV = 'test';
});

afterAll(async () => {
    // Cleanup após todos os testes
    await new Promise(resolve => setTimeout(resolve, 500));

    // Fechar conexões se necessário
    if (global.gc) {
        global.gc();
    }
});

// Cleanup após cada teste
afterEach(async () => {
    // Limpar mocks
    jest.clearAllMocks();
});