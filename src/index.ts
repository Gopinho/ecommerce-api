import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './lib/swagger';
import { errorHandler } from './middlewares/errorHandler';
import i18n from 'i18n';
import path from 'path';

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

const app = express();
i18n.configure({
  locales: ['pt', 'en'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'pt',
  objectNotation: true,
  queryParameter: 'lang'
});

app.use(i18n.init);
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/api/products', productRoutes); 
app.use('/api/categories', categoryRoutes);
app.use('/admin', adminRoutes);
app.use('/webhook', webhookRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/admin/audit-logs', auditRoutes);
app.use('/reviews', reviewRoutes);
app.use('/coupon', couponRoutes);
app.use('/invoice', invoiceRoutes);
app.use('/license', licenseRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/upload', uploadRoutes);
app.use('/user', userRoutes);
app.use('/currency', currencyRoutes);

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
  app.listen(3000, () => {
    console.log('Servidor a correr em http://localhost:3000');
  });
}

app.use(errorHandler);
export default app;