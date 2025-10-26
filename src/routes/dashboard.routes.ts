import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';
import liveRoutes from './live.routes';

const router = Router();

// Middleware: Todas as rotas da dashboard requerem autenticação de administrador
router.use(authenticate);
router.use(authorizeRole('ADMIN'));

// Rotas de atualizações em tempo real
router.use('/live', liveRoutes);

// ==================== STATS BÁSICOS ====================

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     tags: [Dashboard - Básico]
 *     summary: Obter estatísticas básicas do dashboard (Admin)
 *     description: Endpoint simples com métricas essenciais para compatibilidade
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas básicas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_users:
 *                       type: integer
 *                       description: Total de usuários
 *                     total_products:
 *                       type: integer
 *                       description: Total de produtos
 *                     total_sales:
 *                       type: number
 *                       description: Total de vendas
 *                     pending_orders:
 *                       type: integer
 *                       description: Pedidos pendentes
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp da consulta
 */
router.get('/stats', dashboardController.getStats);

/**
 * @swagger
 * components:
 *   schemas:
 *     SalesMetrics:
 *       type: object
 *       properties:
 *         totalSold:
 *           type: number
 *           description: Total vendido (todos os tempos)
 *         monthlyGrowth:
 *           type: number
 *           description: Crescimento mensal em percentagem
 *         totalProfit:
 *           type: number
 *           description: Lucro total estimado
 *     
 *     FinanceMetrics:
 *       type: object
 *       properties:
 *         totalRevenue:
 *           type: number
 *           description: Receita total
 *         totalExpenses:
 *           type: number
 *           description: Despesas totais
 *         totalSupplierOrders:
 *           type: integer
 *           description: Número de encomendas a fornecedores
 *         supplierOrdersValue:
 *           type: number
 *           description: Valor total das encomendas a fornecedores
 *     
 *     DashboardMetrics:
 *       type: object
 *       properties:
 *         totalClients:
 *           type: integer
 *           description: Total de clientes
 *         totalCompletedOrders:
 *           type: integer
 *           description: Total de encomendas completas
 *         monthlySales:
 *           type: number
 *           description: Vendas do mês atual
 *     
 *     MonthlySalesData:
 *       type: object
 *       properties:
 *         month:
 *           type: string
 *           description: Nome do mês
 *         year:
 *           type: integer
 *           description: Ano
 *         sales:
 *           type: number
 *           description: Vendas do mês
 *         revenue:
 *           type: number
 *           description: Receita do mês
 *         orders:
 *           type: integer
 *           description: Número de encomendas do mês
 *     
 *     RecentOrder:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID da encomenda
 *         orderNumber:
 *           type: string
 *           description: Número da encomenda
 *         customerName:
 *           type: string
 *           description: Nome do cliente
 *         customerEmail:
 *           type: string
 *           description: Email do cliente
 *         total:
 *           type: number
 *           description: Total da encomenda
 *         status:
 *           type: string
 *           description: Status da encomenda
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 */

// ==================== FINANÇAS ====================

/**
 * @swagger
 * /dashboard/finance/metrics:
 *   get:
 *     tags: [Dashboard - Finanças]
 *     summary: Obter métricas financeiras principais (Admin)
 *     description: Retorna total vendido, crescimento mensal, lucro total, receitas e despesas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas financeiras obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     sales:
 *                       $ref: '#/components/schemas/SalesMetrics'
 *                     finance:
 *                       $ref: '#/components/schemas/FinanceMetrics'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         netProfit:
 *                           type: number
 *                           description: Lucro líquido (receita - despesas)
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não autorizado (apenas administradores)
 */
router.get('/finance/metrics', dashboardController.getFinanceMetrics);

/**
 * @swagger
 * /dashboard/finance/supplier-orders:
 *   get:
 *     tags: [Dashboard - Finanças]
 *     summary: Obter overview das encomendas a fornecedores (Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview de encomendas a fornecedores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: integer
 *                     totalValue:
 *                       type: number
 *                     averageOrderValue:
 *                       type: number
 */
router.get('/finance/supplier-orders', dashboardController.getSupplierOrdersOverview);

// ==================== DASHBOARD GERAL ====================

/**
 * @swagger
 * /dashboard/overview/metrics:
 *   get:
 *     tags: [Dashboard - Geral]
 *     summary: Obter métricas principais do dashboard (Admin)
 *     description: Total de clientes, encomendas completas e vendas mensais
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas do dashboard obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DashboardMetrics'
 */
router.get('/overview/metrics', dashboardController.getDashboardOverview);

/**
 * @swagger
 * /dashboard/overview/monthly-sales:
 *   get:
 *     tags: [Dashboard - Geral]
 *     summary: Obter estatísticas de vendas dos últimos 8 meses (Admin)
 *     description: Dados para gráfico de vendas mensais
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados de vendas mensais obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     chartData:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MonthlySalesData'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalMonths:
 *                           type: integer
 *                         totalSales:
 *                           type: number
 *                         totalOrders:
 *                           type: integer
 *                         averageMonthlySales:
 *                           type: number
 */
router.get('/overview/monthly-sales', dashboardController.getMonthlySalesChart);

/**
 * @swagger
 * /dashboard/overview/recent-orders:
 *   get:
 *     tags: [Dashboard - Geral]
 *     summary: Obter as 5 encomendas mais recentes (Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Encomendas recentes obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RecentOrder'
 *                     count:
 *                       type: integer
 */
router.get('/overview/recent-orders', dashboardController.getRecentOrders);

// ==================== ENCOMENDAS ====================

/**
 * @swagger
 * /dashboard/orders/metrics:
 *   get:
 *     tags: [Dashboard - Encomendas]
 *     summary: Obter métricas de encomendas (Admin)
 *     description: Encomendas pendentes, completas, lucro total e taxa de conversão
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas de encomendas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     pendingOrders:
 *                       type: integer
 *                     completedOrders:
 *                       type: integer
 *                     totalProfit:
 *                       type: number
 *                     conversionRate:
 *                       type: number
 */
router.get('/orders/metrics', dashboardController.getOrderMetrics);

/**
 * @swagger
 * /dashboard/orders/list:
 *   get:
 *     tags: [Dashboard - Encomendas]
 *     summary: Obter lista completa de encomendas com paginação (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PAID, SHIPPED, CANCELLED]
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Lista de encomendas obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RecentOrder'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 */
router.get('/orders/list', dashboardController.getAllOrders);

// ==================== UTILIZADORES ====================

/**
 * @swagger
 * /dashboard/users/list:
 *   get:
 *     tags: [Dashboard - Utilizadores]
 *     summary: Obter lista completa de utilizadores com informações detalhadas (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite por página
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [CLIENT, ADMIN]
 *         description: Filtrar por role
 *     responses:
 *       200:
 *         description: Lista de utilizadores obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           position:
 *                             type: string
 *                           address:
 *                             type: string
 *                           city:
 *                             type: string
 *                           district:
 *                             type: string
 *                           country:
 *                             type: string
 *                           postalCode:
 *                             type: string
 *                           taxNumber:
 *                             type: string
 *                           role:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 */
router.get('/users/list', dashboardController.getAllUsers);

// ==================== ENDPOINT COMPLETO ====================

/**
 * @swagger
 * /dashboard/all-metrics:
 *   get:
 *     tags: [Dashboard - Completo]
 *     summary: Obter todas as métricas em um só endpoint (Admin)
 *     description: Endpoint completo com todas as métricas para carregamento inicial da dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas as métricas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     finance:
 *                       type: object
 *                       properties:
 *                         metrics:
 *                           $ref: '#/components/schemas/SalesMetrics'
 *                         revenue:
 *                           $ref: '#/components/schemas/FinanceMetrics'
 *                         netProfit:
 *                           type: number
 *                     dashboard:
 *                       type: object
 *                       properties:
 *                         metrics:
 *                           $ref: '#/components/schemas/DashboardMetrics'
 *                         monthlySales:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/MonthlySalesData'
 *                         recentOrders:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/RecentOrder'
 *                     orders:
 *                       type: object
 *                       properties:
 *                         metrics:
 *                           type: object
 *                           properties:
 *                             pendingOrders:
 *                               type: integer
 *                             completedOrders:
 *                               type: integer
 *                             totalProfit:
 *                               type: number
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalRevenue:
 *                           type: number
 *                         totalProfit:
 *                           type: number
 *                         totalClients:
 *                           type: integer
 *                         totalOrders:
 *                           type: integer
 *                         monthlyGrowth:
 *                           type: number
 */
router.get('/all-metrics', dashboardController.getAllMetrics);

export default router;