import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './lib/swagger';
import { errorHandler } from './middlewares/errorHandler';
import { metricsMiddleware } from './controllers/metrics.controller';
import i18n from 'i18n';
import path from 'path';
import helmet from 'helmet';
import cors from './config/cors';

dotenv.config();

import express from 'express';
import prisma from './prisma/client';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import cartRoutes from './routes/cart.routes';
import webhookRoutes from './routes/webhook.routes';
import checkoutRoutes from './routes/checkout.routes';
import wishlistRoutes from './routes/wishlist.routes';
import auditRoutes from './routes/audit.routes';
import reviewRoutes from './routes/review.routes';
import couponRoutes from './routes/coupon.routes';
import invoiceRoutes from './routes/invoice.routes';
import licenseRoutes from './routes/license.routes';
import uploadRoutes from './routes/upload.routes';
import userRoutes from './routes/user.routes';
import currencyRoutes from './routes/currency.routes';
import permissionRoutes from './routes/permission.routes';
import productVariantRoutes from './routes/productVariant.routes';
import sizeGuideRoutes from './routes/sizeGuide.routes';
import filterRoutes from './routes/filter.routes';
import productImageRoutes from './routes/productImage.routes';
import orderRoutes from './routes/order.routes';
import collectionRoutes from './routes/collection.routes';
import supplierRoutes from './routes/supplier.routes';
import supplierOrderRoutes from './routes/supplierOrder.routes';
import stockRoutes from './routes/stock.routes';
import dashboardRoutes from './routes/dashboard.routes';
import telegramRoutes from './routes/telegram.routes';
import healthRoutes from './routes/health.routes';
import metricsRoutes from './routes/metrics.routes';
import * as sseService from './services/sse.service';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors);

i18n.configure({
    locales: ['pt', 'en'],
    directory: path.join(__dirname, 'locales'),
    defaultLocale: 'pt',
    objectNotation: true,
    queryParameter: 'lang'
});

app.use(i18n.init);
app.use(express.json());

// Metrics middleware (antes das rotas)
app.use(metricsMiddleware);

app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/admin', adminRoutes);
app.use('/webhook', webhookRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/admin/audit-logs', auditRoutes);
app.use('/reviews', reviewRoutes);
app.use('/coupon', couponRoutes);
app.use('/invoice', invoiceRoutes);
app.use('/license', licenseRoutes);

// Configuração do Swagger UI com opções adicionais
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'E-Commerce API Documentation',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true
    }
}));

// Rota para verificar a especificação Swagger em JSON
app.get('/swagger.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use('/upload', uploadRoutes);
app.use('/user', userRoutes);
app.use('/currency', currencyRoutes);
app.use('/api', permissionRoutes);
app.use('/variants', productVariantRoutes);
app.use('/size-guides', sizeGuideRoutes);
app.use('/filter', filterRoutes);
app.use('/product-images', productImageRoutes);
app.use('/orders', orderRoutes);
app.use('/collections', collectionRoutes);
app.use('/suppliers', supplierRoutes);
app.use('/supplier-orders', supplierOrderRoutes);
app.use('/stock', stockRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/telegram', telegramRoutes);
app.use('/health', healthRoutes);
app.use('/metrics', metricsRoutes);

app.get('/', (_req, res) => {
    res.send('Servidor Express está a funcionar!');
});

app.get('/users', async (_req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

app.get('/success', (_req, res) => {
    res.send('Pagamento realizado com sucesso! Obrigado pela sua compra.');
});

app.get('/cancel', (_req, res) => {
    res.send('Pagamento cancelado.');
});

// Teste endpoint é apenas para simular um erro e verificar se o Telegram recebe a notificação
app.get('/test-error', (_req, _res, _next) => {
    throw new Error('Erro de teste para Telegram');
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor a correr em http://localhost:${PORT}`);

        // Inicializar serviço SSE para atualizações em tempo real
        sseService.initializeSSE();
        sseService.scheduleAutomaticUpdates();

        console.log('📡 Sistema de atualizações em tempo real ativo');
    });
}

app.use(errorHandler);
export default app;