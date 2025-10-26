// Test app sem inicializar serviços pesados como SSE, WebSocket, etc.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from '../middlewares/errorHandler';

// Import routes
import authRoutes from '../routes/auth.routes';
import cartRoutes from '../routes/cart.routes';
import productRoutes from '../routes/product.routes';
import categoryRoutes from '../routes/category.routes';

const app = express();

// Mock do i18n para testes
app.use((req: any, res, next) => {
    req.__ = (key: string) => key; // Retorna a própria chave
    next();
});

// Middlewares básicos para testes
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Rotas principais para testes
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);

// Handler de erros
app.use(errorHandler);

export default app;