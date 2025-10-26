// Especificação Swagger estática - sem dependência de swaggerJSDoc
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'E-Commerce API',
        version: '1.0.0',
        description: 'API completa para e-commerce com dashboard em tempo real'
    },
    servers: [
        {
            url: 'http://localhost:4000',
            description: 'Servidor de desenvolvimento'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Token JWT obtido através do endpoint de login'
            }
        },
        schemas: {
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 }
                }
            },
            Product: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number' },
                    category: { type: 'string' },
                    created_at: { type: 'string', format: 'date-time' }
                }
            },
            Order: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    user_id: { type: 'string' },
                    status: { type: 'string', enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] },
                    total: { type: 'number' },
                    created_at: { type: 'string', format: 'date-time' }
                }
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    name: { type: 'string' },
                    role: { type: 'string', enum: ['ADMIN', 'USER'] },
                    created_at: { type: 'string', format: 'date-time' }
                }
            },
            Category: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    parent_id: { type: 'string', nullable: true }
                }
            },
            Supplier: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    address: { type: 'string' }
                }
            },
            Review: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    product_id: { type: 'string' },
                    user_id: { type: 'string' },
                    rating: { type: 'integer', minimum: 1, maximum: 5 },
                    comment: { type: 'string' },
                    created_at: { type: 'string', format: 'date-time' }
                }
            },
            Cart: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    user_id: { type: 'string' },
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                product_id: { type: 'string' },
                                quantity: { type: 'integer' },
                                price: { type: 'number' }
                            }
                        }
                    }
                }
            },
            Coupon: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    code: { type: 'string' },
                    discount_type: { type: 'string', enum: ['PERCENTAGE', 'FIXED'] },
                    discount_value: { type: 'number' },
                    valid_until: { type: 'string', format: 'date-time' }
                }
            },
            DashboardStats: {
                type: 'object',
                properties: {
                    total_users: { type: 'integer' },
                    total_products: { type: 'integer' },
                    total_sales: { type: 'number' },
                    pending_orders: { type: 'integer' },
                    timestamp: { type: 'string', format: 'date-time' }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    status: { type: 'integer' }
                }
            },
            // === NEWSLETTER SCHEMAS ===
            NewsletterSubscriber: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    isActive: { type: 'boolean' },
                    preferences: { type: 'object' },
                    source: { type: 'string' },
                    subscribedAt: { type: 'string', format: 'date-time' },
                    unsubscribedAt: { type: 'string', format: 'date-time', nullable: true },
                    confirmedAt: { type: 'string', format: 'date-time', nullable: true }
                }
            },
            NewsletterSubscribeRequest: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    preferences: {
                        type: 'object',
                        properties: {
                            frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
                            categories: {
                                type: 'array',
                                items: { type: 'string' }
                            }
                        }
                    },
                    source: { type: 'string', default: 'website' }
                }
            },
            NewsletterCampaign: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    subject: { type: 'string' },
                    content: { type: 'string' },
                    plainText: { type: 'string' },
                    status: {
                        type: 'string',
                        enum: ['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'CANCELLED']
                    },
                    type: {
                        type: 'string',
                        enum: ['GENERAL', 'WELCOME', 'PROMOTIONAL', 'NEW_ARRIVALS', 'ABANDONED_CART', 'WIN_BACK', 'SEASONAL']
                    },
                    scheduledFor: { type: 'string', format: 'date-time', nullable: true },
                    sentAt: { type: 'string', format: 'date-time', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    totalSent: { type: 'integer' },
                    opened: { type: 'integer' },
                    clicked: { type: 'integer' },
                    bounced: { type: 'integer' },
                    unsubscribed: { type: 'integer' }
                }
            },
            NewsletterCampaignRequest: {
                type: 'object',
                required: ['name', 'subject', 'content'],
                properties: {
                    name: { type: 'string' },
                    subject: { type: 'string' },
                    content: { type: 'string' },
                    plainText: { type: 'string' },
                    type: {
                        type: 'string',
                        enum: ['GENERAL', 'WELCOME', 'PROMOTIONAL', 'NEW_ARRIVALS', 'ABANDONED_CART', 'WIN_BACK', 'SEASONAL'],
                        default: 'GENERAL'
                    },
                    targetTags: {
                        type: 'array',
                        items: { type: 'string' }
                    },
                    scheduledFor: { type: 'string', format: 'date-time' }
                }
            },
            NewsletterTemplate: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    content: { type: 'string' },
                    variables: { type: 'object' },
                    type: {
                        type: 'string',
                        enum: ['GENERAL', 'WELCOME', 'PROMOTIONAL', 'NEW_ARRIVALS', 'ABANDONED_CART', 'WIN_BACK', 'SEASONAL']
                    },
                    isActive: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            NewsletterTag: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    color: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            NewsletterCampaignStats: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    subject: { type: 'string' },
                    status: { type: 'string' },
                    sentAt: { type: 'string', format: 'date-time' },
                    totalSent: { type: 'integer' },
                    opened: { type: 'integer' },
                    clicked: { type: 'integer' },
                    bounced: { type: 'integer' },
                    unsubscribed: { type: 'integer' },
                    openRate: { type: 'string' },
                    clickRate: { type: 'string' }
                }
            }
        }
    },
    paths: {
        // === AUTENTICAÇÃO ===
        '/auth/login': {
            post: {
                summary: 'Login do usuário',
                tags: ['Autenticação'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LoginRequest' }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Login realizado com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        token: { type: 'string' },
                                        user: { $ref: '#/components/schemas/User' }
                                    }
                                }
                            }
                        }
                    },
                    '401': { description: 'Credenciais inválidas' }
                }
            }
        },
        '/auth/register': {
            post: {
                summary: 'Registro de novo usuário',
                tags: ['Autenticação'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password', 'name'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 8 },
                                    name: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Usuário criado com sucesso' },
                    '400': { description: 'Dados inválidos' }
                }
            }
        },
        '/auth/me': {
            get: {
                summary: 'Informações do usuário atual',
                tags: ['Autenticação'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Informações do usuário',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/User' }
                            }
                        }
                    }
                }
            }
        },
        '/auth/refresh': {
            post: {
                summary: 'Atualizar token JWT',
                tags: ['Autenticação'],
                responses: {
                    '200': { description: 'Token atualizado com sucesso' },
                    '401': { description: 'Token inválido ou expirado' }
                }
            }
        },
        '/auth/logout': {
            post: {
                summary: 'Logout do usuário',
                tags: ['Autenticação'],
                responses: {
                    '200': { description: 'Logout realizado com sucesso' }
                }
            }
        },
        '/auth/2fa/setup': {
            post: {
                summary: 'Configurar autenticação de dois fatores',
                tags: ['Autenticação'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: '2FA configurado com sucesso' },
                    '401': { description: 'Não autenticado' }
                }
            }
        },
        '/auth/2fa/verify': {
            post: {
                summary: 'Verificar código 2FA',
                tags: ['Autenticação'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['code'],
                                properties: {
                                    code: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: '2FA verificado com sucesso' },
                    '401': { description: 'Código inválido' }
                }
            }
        },
        '/auth/2fa/disable': {
            post: {
                summary: 'Desativar autenticação de dois fatores',
                tags: ['Autenticação'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: '2FA desativado com sucesso' },
                    '401': { description: 'Não autenticado' }
                }
            }
        },
        '/auth/request-password-reset': {
            post: {
                summary: 'Solicitar redefinição de senha',
                tags: ['Autenticação'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email'],
                                properties: {
                                    email: { type: 'string', format: 'email' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Email de redefinição enviado' }
                }
            }
        },
        '/auth/reset-password': {
            post: {
                summary: 'Redefinir senha',
                tags: ['Autenticação'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['token', 'newPassword'],
                                properties: {
                                    token: { type: 'string' },
                                    newPassword: { type: 'string', minLength: 8 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Senha redefinida com sucesso' },
                    '400': { description: 'Token inválido ou expirado' }
                }
            }
        },
        '/auth/change-email': {
            post: {
                summary: 'Alterar email do usuário',
                tags: ['Autenticação'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['newEmail'],
                                properties: {
                                    newEmail: { type: 'string', format: 'email' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Email alterado com sucesso' },
                    '409': { description: 'Email já está em uso' }
                }
            }
        },

        // === PRODUTOS ===
        '/products': {
            get: {
                summary: 'Listar produtos',
                tags: ['Produtos'],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                    { name: 'category', in: 'query', schema: { type: 'string' } },
                    { name: 'search', in: 'query', schema: { type: 'string' } }
                ],
                responses: {
                    '200': {
                        description: 'Lista de produtos',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        products: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Product' }
                                        },
                                        total: { type: 'integer' },
                                        page: { type: 'integer' },
                                        pages: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                summary: 'Criar produto',
                tags: ['Produtos'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'price', 'category_id'],
                                properties: {
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    price: { type: 'number' },
                                    category_id: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Produto criado com sucesso' },
                    '401': { description: 'Não autorizado' }
                }
            }
        },
        '/products/{id}': {
            get: {
                summary: 'Obter produto por ID',
                tags: ['Produtos'],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': {
                        description: 'Detalhes do produto',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Product' }
                            }
                        }
                    },
                    '404': { description: 'Produto não encontrado' }
                }
            },
            put: {
                summary: 'Atualizar produto',
                tags: ['Produtos'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Produto atualizado com sucesso' },
                    '404': { description: 'Produto não encontrado' }
                }
            },
            delete: {
                summary: 'Excluir produto',
                tags: ['Produtos'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Produto excluído com sucesso' },
                    '404': { description: 'Produto não encontrado' }
                }
            }
        },
        '/products/popular': {
            get: {
                summary: 'Listar produtos populares',
                tags: ['Produtos'],
                responses: {
                    '200': {
                        description: 'Lista de produtos populares',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { '$ref': '#/components/schemas/Product' }
                                }
                            }
                        }
                    }
                }
            }
        },

        // === PEDIDOS ===
        '/orders': {
            get: {
                summary: 'Listar pedidos',
                tags: ['Pedidos'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Lista de pedidos',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Order' }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                summary: 'Criar pedido',
                tags: ['Pedidos'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '201': { description: 'Pedido criado com sucesso' }
                }
            }
        },
        '/orders/{id}': {
            get: {
                summary: 'Obter pedido por ID',
                tags: ['Pedidos'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': {
                        description: 'Detalhes do pedido',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Order' }
                            }
                        }
                    }
                }
            }
        },
        '/orders/my': {
            get: {
                summary: 'Obter minhas encomendas',
                tags: ['Pedidos'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
                ],
                responses: {
                    '200': {
                        description: 'Lista das minhas encomendas',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        orders: {
                                            type: 'array',
                                            items: { '$ref': '#/components/schemas/Order' }
                                        },
                                        pagination: {
                                            type: 'object',
                                            properties: {
                                                page: { type: 'integer' },
                                                limit: { type: 'integer' },
                                                total: { type: 'integer' },
                                                pages: { type: 'integer' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/orders/stats': {
            get: {
                summary: 'Estatísticas dos pedidos (Admin)',
                tags: ['Pedidos'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Estatísticas dos pedidos',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        totalOrders: { type: 'integer' },
                                        pendingOrders: { type: 'integer' },
                                        paidOrders: { type: 'integer' },
                                        shippedOrders: { type: 'integer' },
                                        cancelledOrders: { type: 'integer' },
                                        totalRevenue: { type: 'number' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/orders/{id}/status': {
            put: {
                summary: 'Atualizar status do pedido (Admin)',
                tags: ['Pedidos'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['status'],
                                properties: {
                                    status: {
                                        type: 'string',
                                        enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Status atualizado com sucesso' },
                    '404': { description: 'Pedido não encontrado' }
                }
            }
        },
        '/orders/{id}/cancel': {
            post: {
                summary: 'Cancelar pedido',
                tags: ['Pedidos'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Pedido cancelado com sucesso' },
                    '400': { description: 'Pedido não pode ser cancelado' },
                    '404': { description: 'Pedido não encontrado' }
                }
            }
        },

        // === CATEGORIAS ===
        '/categories': {
            get: {
                summary: 'Listar categorias',
                tags: ['Categorias'],
                responses: {
                    '200': {
                        description: 'Lista de categorias',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Category' }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                summary: 'Criar categoria',
                tags: ['Categorias'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '201': { description: 'Categoria criada com sucesso' }
                }
            }
        },

        // === COLEÇÕES ===
        '/collections': {
            get: {
                summary: 'Listar coleções',
                tags: ['Coleções'],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                    { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
                    { name: 'isFeatured', in: 'query', schema: { type: 'boolean' } },
                    { name: 'season', in: 'query', schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Lista de coleções' }
                }
            },
            post: {
                summary: 'Criar coleção',
                tags: ['Coleções'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name'],
                                properties: {
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    season: { type: 'string' },
                                    year: { type: 'integer' },
                                    launchDate: { type: 'string', format: 'date-time' },
                                    coverImage: { type: 'string' },
                                    slug: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Coleção criada com sucesso' },
                    '400': { description: 'Nome é obrigatório' },
                    '409': { description: 'Coleção já existe' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },
        '/collections/featured': {
            get: {
                summary: 'Obter coleções em destaque',
                tags: ['Coleções'],
                responses: {
                    '200': { description: 'Coleções em destaque' }
                }
            }
        },
        '/collections/stats': {
            get: {
                summary: 'Obter estatísticas das coleções',
                tags: ['Coleções'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Estatísticas das coleções' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },
        '/collections/slug/{slug}': {
            get: {
                summary: 'Obter coleção por slug',
                tags: ['Coleções'],
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Detalhes da coleção' },
                    '404': { description: 'Coleção não encontrada' }
                }
            }
        },

        // === CARRINHO ===
        '/cart': {
            get: {
                summary: 'Obter carrinho do usuário',
                tags: ['Carrinho'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Carrinho do usuário',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Cart' }
                            }
                        }
                    },
                    '401': { description: 'Não autenticado' }
                }
            },
            post: {
                summary: 'Adicionar item ao carrinho',
                tags: ['Carrinho'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['productId', 'quantity'],
                                properties: {
                                    productId: { type: 'string' },
                                    quantity: { type: 'integer', minimum: 1 },
                                    variantId: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Item adicionado ao carrinho' },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autenticado' }
                }
            }
        },
        '/cart/{id}': {
            put: {
                summary: 'Atualizar quantidade no carrinho',
                tags: ['Carrinho'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['quantity'],
                                properties: {
                                    quantity: { type: 'integer', minimum: 1 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Item atualizado no carrinho' },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autenticado' },
                    '404': { description: 'Item não encontrado' }
                }
            },
            delete: {
                summary: 'Remover item do carrinho',
                tags: ['Carrinho'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Item removido do carrinho' },
                    '401': { description: 'Não autenticado' },
                    '404': { description: 'Item não encontrado' }
                }
            }
        },

        // === CHECKOUT EXPANDIDO ===
        '/checkout': {
            post: {
                summary: 'Processar checkout',
                tags: ['Checkout'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    couponCode: { type: 'string' },
                                    shippingAddress: {
                                        type: 'object',
                                        properties: {
                                            street: { type: 'string' },
                                            city: { type: 'string' },
                                            postalCode: { type: 'string' },
                                            country: { type: 'string' }
                                        }
                                    },
                                    paymentMethod: { type: 'string', enum: ['card', 'paypal', 'bank_transfer'] }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Checkout processado com sucesso' }
                }
            }
        },
        '/checkout/session': {
            post: {
                summary: 'Criar sessão de pagamento Stripe',
                tags: ['Checkout'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Sessão criada com sucesso' }
                }
            }
        },

        // === FORNECEDORES ===
        '/suppliers': {
            get: {
                summary: 'Listar fornecedores',
                tags: ['Fornecedores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                    { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
                    { name: 'search', in: 'query', schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Lista de fornecedores' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            },
            post: {
                summary: 'Criar fornecedor',
                tags: ['Fornecedores'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name'],
                                properties: {
                                    name: { type: 'string' },
                                    contactName: { type: 'string' },
                                    email: { type: 'string', format: 'email' },
                                    phone: { type: 'string' },
                                    address: { type: 'string' },
                                    city: { type: 'string' },
                                    country: { type: 'string' },
                                    postalCode: { type: 'string' },
                                    taxNumber: { type: 'string' },
                                    website: { type: 'string', format: 'uri' },
                                    notes: { type: 'string' },
                                    paymentTerms: { type: 'string' },
                                    currency: { type: 'string', minLength: 3, maxLength: 3 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Fornecedor criado com sucesso' },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },
        '/suppliers/stats': {
            get: {
                summary: 'Obter estatísticas dos fornecedores',
                tags: ['Fornecedores'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Estatísticas dos fornecedores' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },

        // === PEDIDOS DE FORNECEDORES ===
        '/supplier-orders': {
            get: {
                summary: 'Listar encomendas de fornecedores',
                tags: ['Pedidos de Fornecedores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                    { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDENTE', 'ENVIADA', 'RECEBIDA', 'CANCELADA'] } },
                    { name: 'supplierId', in: 'query', schema: { type: 'string' } },
                    { name: 'search', in: 'query', schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Lista de encomendas' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            },
            post: {
                summary: 'Criar encomenda para fornecedor',
                tags: ['Pedidos de Fornecedores'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['supplierId', 'items'],
                                properties: {
                                    supplierId: { type: 'string' },
                                    orderNumber: { type: 'string' },
                                    expectedDate: { type: 'string', format: 'date-time' },
                                    notes: { type: 'string' },
                                    currency: { type: 'string', minLength: 3, maxLength: 3 },
                                    items: {
                                        type: 'array',
                                        minItems: 1,
                                        items: {
                                            type: 'object',
                                            required: ['productName', 'quantity', 'unitPrice'],
                                            properties: {
                                                productId: { type: 'string' },
                                                productName: { type: 'string' },
                                                description: { type: 'string' },
                                                quantity: { type: 'integer', minimum: 1 },
                                                unitPrice: { type: 'number', minimum: 0 },
                                                sku: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Encomenda criada com sucesso' },
                    '400': { description: 'Dados inválidos' },
                    '404': { description: 'Fornecedor não encontrado' },
                    '409': { description: 'Número da encomenda já existe' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },
        '/supplier-orders/stats': {
            get: {
                summary: 'Obter estatísticas das encomendas',
                tags: ['Pedidos de Fornecedores'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Estatísticas das encomendas' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },

        // === ESTOQUE ===
        '/stock/low-stock/products': {
            get: {
                summary: 'Obter produtos com stock baixo',
                tags: ['Estoque'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'threshold', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Limite de stock considerado baixo' }
                ],
                responses: {
                    '200': { description: 'Lista de produtos com stock baixo' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },
        '/stock/statistics/overview': {
            get: {
                summary: 'Obter estatísticas gerais de stock',
                tags: ['Estoque'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Estatísticas de stock' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },
        '/stock/{id}': {
            get: {
                summary: 'Obter informações de stock de um produto',
                tags: ['Estoque'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID do produto' }
                ],
                responses: {
                    '200': { description: 'Informações de stock obtidas com sucesso' },
                    '404': { description: 'Produto não encontrado' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            },
            put: {
                summary: 'Atualizar stock de um produto',
                tags: ['Estoque'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID do produto' }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    realStock: { type: 'integer', minimum: 0, description: 'Stock físico real disponível' },
                                    fictionalStock: { type: 'integer', minimum: 0, description: 'Stock fictício/planejado para a coleção' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Stock atualizado com sucesso' },
                    '400': { description: 'Dados inválidos' },
                    '404': { description: 'Produto não encontrado' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },

        // === AVALIAÇÕES ===
        '/reviews/user/{userId}': {
            get: {
                summary: 'Obter avaliações por usuário',
                tags: ['Avaliações'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'userId', in: 'path', required: true, schema: { type: 'string' }, description: 'ID do usuário' }
                ],
                responses: {
                    '200': { description: 'Avaliações obtidas com sucesso' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },
        '/reviews/{productId}': {
            get: {
                summary: 'Obter avaliações por produto',
                tags: ['Avaliações'],
                parameters: [
                    { name: 'productId', in: 'path', required: true, schema: { type: 'string' }, description: 'ID do produto' }
                ],
                responses: {
                    '200': { description: 'Avaliações obtidas com sucesso' },
                    '404': { description: 'Produto não encontrado' }
                }
            },
            post: {
                summary: 'Criar ou atualizar avaliação',
                tags: ['Avaliações'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'productId', in: 'path', required: true, schema: { type: 'string' }, description: 'ID do produto' }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['rating'],
                                properties: {
                                    rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Classificação de 1 a 5 estrelas' },
                                    comment: { type: 'string', maxLength: 1000, description: 'Comentário opcional sobre o produto' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Avaliação criada ou atualizada com sucesso' },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autenticado' }
                }
            },
            delete: {
                summary: 'Remover avaliação',
                tags: ['Avaliações'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'productId', in: 'path', required: true, schema: { type: 'string' }, description: 'ID do produto' }
                ],
                responses: {
                    '204': { description: 'Avaliação removida com sucesso' },
                    '401': { description: 'Não autenticado' },
                    '404': { description: 'Avaliação não encontrada' }
                }
            }
        },
        '/reviews/{productId}/average': {
            get: {
                summary: 'Obter média de avaliações',
                tags: ['Avaliações'],
                parameters: [
                    { name: 'productId', in: 'path', required: true, schema: { type: 'string' }, description: 'ID do produto' }
                ],
                responses: {
                    '200': { description: 'Média de avaliações obtida com sucesso' },
                    '404': { description: 'Produto não encontrado' }
                }
            }
        },

        // === CUPONS ===
        '/coupon': {
            post: {
                summary: 'Criar novo cupom',
                tags: ['Cupons'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['code', 'amount', 'discountType'],
                                properties: {
                                    code: { type: 'string', minLength: 3, description: 'Código único do cupom' },
                                    amount: { type: 'number', minimum: 0, description: 'Valor do desconto' },
                                    discountType: { type: 'string', enum: ['percent', 'fixed'], description: 'Tipo de desconto (percentual ou valor fixo)' },
                                    expiresAt: { type: 'string', format: 'date-time', description: 'Data de expiração (opcional)' },
                                    usageLimit: { type: 'integer', minimum: 1, description: 'Limite de usos (opcional)' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Cupom criado com sucesso' },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },
        '/coupon/{code}': {
            get: {
                summary: 'Obter cupom por código',
                tags: ['Cupons'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'code', in: 'path', required: true, schema: { type: 'string' }, description: 'Código do cupom' }
                ],
                responses: {
                    '200': { description: 'Cupom encontrado com sucesso' },
                    '401': { description: 'Não autenticado' },
                    '404': { description: 'Cupom não encontrado' }
                }
            }
        },

        // === USUÁRIOS ===
        '/user/export': {
            get: {
                summary: 'Exportar todos os dados do utilizador autenticado (GDPR)',
                tags: ['Usuários'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Dados exportados em JSON',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string', description: 'ID do utilizador' },
                                        email: { type: 'string', description: 'Email do utilizador' },
                                        name: { type: 'string', description: 'Nome do utilizador' },
                                        role: { type: 'string', description: 'Role do utilizador' },
                                        orders: { type: 'array', description: 'Encomendas do utilizador' },
                                        auditLogs: { type: 'array', description: 'Logs de auditoria' },
                                        reviews: { type: 'array', description: 'Avaliações do utilizador' },
                                        wishlist: { type: 'array', description: 'Lista de desejos' }
                                    }
                                }
                            }
                        }
                    },
                    '401': { description: 'Não autenticado (token JWT obrigatório)' },
                    '404': { description: 'Utilizador não encontrado' }
                }
            }
        },

        // === ADMINISTRAÇÃO ===
        '/admin': {
            get: {
                summary: 'Área administrativa',
                tags: ['Administração'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Acesso à área administrativa',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string', example: 'Área administrativa' }
                                    }
                                }
                            }
                        }
                    },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },
        '/admin/stats': {
            get: {
                summary: 'Estatísticas administrativas',
                tags: ['Administração'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'recentOrdersLimit',
                        in: 'query',
                        required: false,
                        schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
                        description: 'Limite de pedidos recentes a retornar'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Estatísticas administrativas obtidas com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        totalSales: { type: 'integer', description: 'Total de vendas' },
                                        totalRevenue: { type: 'number', description: 'Receita total' },
                                        totalUsers: { type: 'integer', description: 'Total de utilizadores' },
                                        totalProducts: { type: 'integer', description: 'Total de produtos' },
                                        recentOrders: {
                                            type: 'array',
                                            description: 'Pedidos recentes',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'string' },
                                                    total: { type: 'number' },
                                                    status: { type: 'string' },
                                                    createdAt: { type: 'string', format: 'date-time' },
                                                    user: { type: 'object' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Parâmetros inválidos' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },

        // === WEBHOOKS ===
        '/webhook/stripe': {
            post: {
                summary: 'Webhook do Stripe',
                tags: ['Webhooks'],
                responses: {
                    '200': { description: 'Webhook processado com sucesso' }
                }
            }
        },

        // === VARIANTES DE PRODUTOS ===
        '/variants/product/{productId}/variants': {
            get: {
                summary: 'Obter todas as variantes de um produto',
                tags: ['Variantes de Produtos'],
                parameters: [
                    { name: 'productId', in: 'path', required: true, schema: { type: 'string' }, description: 'ID do produto' }
                ],
                responses: {
                    '200': {
                        description: 'Lista de variantes do produto',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'string' },
                                                    productId: { type: 'string' },
                                                    size: { type: 'string' },
                                                    color: { type: 'string' },
                                                    colorHex: { type: 'string' },
                                                    stock: { type: 'integer' },
                                                    price: { type: 'number' },
                                                    sku: { type: 'string' },
                                                    weight: { type: 'number' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/variants/product/{productId}/sizes': {
            get: {
                summary: 'Obter tamanhos disponíveis de um produto',
                tags: ['Variantes de Produtos'],
                parameters: [
                    { name: 'productId', in: 'path', required: true, schema: { type: 'string' }, description: 'ID do produto' }
                ],
                responses: {
                    '200': {
                        description: 'Tamanhos disponíveis (com stock > 0)',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { type: 'array', items: { type: 'string' } }
                                    }
                                }
                            }
                        }
                    },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/variants/product/{productId}/colors': {
            get: {
                summary: 'Obter cores disponíveis de um produto',
                tags: ['Variantes de Produtos'],
                parameters: [
                    { name: 'productId', in: 'path', required: true, schema: { type: 'string' }, description: 'ID do produto' },
                    { name: 'size', in: 'query', required: false, schema: { type: 'string' }, description: 'Filtrar por tamanho específico' }
                ],
                responses: {
                    '200': {
                        description: 'Cores disponíveis (com stock > 0)',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    color: { type: 'string' },
                                                    colorHex: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/variants/product/{productId}/stock': {
            get: {
                summary: 'Verificar stock de uma variante específica',
                tags: ['Variantes de Produtos'],
                parameters: [
                    { name: 'productId', in: 'path', required: true, schema: { type: 'string' }, description: 'ID do produto' },
                    { name: 'size', in: 'query', required: true, schema: { type: 'string' }, description: 'Tamanho da variante' },
                    { name: 'color', in: 'query', required: true, schema: { type: 'string' }, description: 'Cor da variante' }
                ],
                responses: {
                    '200': {
                        description: 'Informações de stock da variante',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                stock: { type: 'integer' },
                                                available: { type: 'boolean' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Tamanho e cor são obrigatórios' },
                    '404': { description: 'Variante não encontrada' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/variants': {
            post: {
                summary: 'Criar nova variante de produto',
                tags: ['Variantes de Produtos'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['productId', 'size', 'color', 'stock'],
                                properties: {
                                    productId: { type: 'string', format: 'uuid', description: 'ID do produto' },
                                    size: { type: 'string', minLength: 1, description: 'Tamanho da variante' },
                                    color: { type: 'string', minLength: 1, description: 'Cor da variante' },
                                    colorHex: { type: 'string', description: 'Código hexadecimal da cor (opcional)' },
                                    stock: { type: 'integer', minimum: 0, description: 'Quantidade em stock' },
                                    price: { type: 'number', minimum: 0, description: 'Preço específico da variante (opcional)' },
                                    sku: { type: 'string', description: 'SKU da variante (opcional)' },
                                    weight: { type: 'number', minimum: 0, description: 'Peso da variante (opcional)' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Variante criada com sucesso' },
                    '400': { description: 'Dados inválidos ou variante já existe' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' },
                    '404': { description: 'Produto não encontrado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/variants/{id}': {
            get: {
                summary: 'Obter variante por ID',
                tags: ['Variantes de Produtos'],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID da variante' }
                ],
                responses: {
                    '200': {
                        description: 'Detalhes da variante',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string' },
                                                productId: { type: 'string' },
                                                size: { type: 'string' },
                                                color: { type: 'string' },
                                                colorHex: { type: 'string' },
                                                stock: { type: 'integer' },
                                                price: { type: 'number' },
                                                sku: { type: 'string' },
                                                weight: { type: 'number' },
                                                product: { type: 'object' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '404': { description: 'Variante não encontrada' },
                    '500': { description: 'Erro interno do servidor' }
                }
            },
            put: {
                summary: 'Atualizar variante',
                tags: ['Variantes de Produtos'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID da variante' }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    size: { type: 'string', minLength: 1, description: 'Tamanho da variante' },
                                    color: { type: 'string', minLength: 1, description: 'Cor da variante' },
                                    colorHex: { type: 'string', description: 'Código hexadecimal da cor' },
                                    stock: { type: 'integer', minimum: 0, description: 'Quantidade em stock' },
                                    price: { type: 'number', minimum: 0, description: 'Preço da variante' },
                                    sku: { type: 'string', description: 'SKU da variante' },
                                    weight: { type: 'number', minimum: 0, description: 'Peso da variante' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Variante atualizada com sucesso' },
                    '400': { description: 'Dados inválidos ou duplicação de variante' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' },
                    '404': { description: 'Variante não encontrada' },
                    '500': { description: 'Erro interno do servidor' }
                }
            },
            delete: {
                summary: 'Apagar variante',
                tags: ['Variantes de Produtos'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID da variante' }
                ],
                responses: {
                    '200': { description: 'Variante eliminada com sucesso' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' },
                    '404': { description: 'Variante não encontrada' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },

        // === IMAGENS DE PRODUTOS ===
        '/product-images/product/{productId}': {
            get: {
                summary: 'Obter todas as imagens de um produto',
                tags: ['Imagens de Produtos'],
                parameters: [
                    { name: 'productId', in: 'path', required: true, schema: { type: 'string' }, description: 'ID do produto' }
                ],
                responses: {
                    '200': {
                        description: 'Lista de imagens do produto (ordenadas por sortOrder)',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'string' },
                                                    productId: { type: 'string' },
                                                    url: { type: 'string' },
                                                    altText: { type: 'string' },
                                                    sortOrder: { type: 'integer' },
                                                    isMain: { type: 'boolean' },
                                                    createdAt: { type: 'string', format: 'date-time' },
                                                    updatedAt: { type: 'string', format: 'date-time' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/product-images/upload': {
            post: {
                summary: 'Upload direto de imagem para produto',
                tags: ['Imagens de Produtos'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['image', 'productId'],
                                properties: {
                                    image: {
                                        type: 'string',
                                        format: 'binary',
                                        description: 'Ficheiro de imagem (JPEG, PNG, GIF, WebP - máx 5MB)'
                                    },
                                    productId: {
                                        type: 'string',
                                        format: 'uuid',
                                        description: 'ID do produto'
                                    },
                                    altText: {
                                        type: 'string',
                                        description: 'Texto alternativo para acessibilidade'
                                    },
                                    sortOrder: {
                                        type: 'integer',
                                        minimum: 0,
                                        description: 'Ordem de exibição (padrão: 0)'
                                    },
                                    isMain: {
                                        type: 'boolean',
                                        description: 'Se é a imagem principal do produto'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Imagem carregada com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string' },
                                                productId: { type: 'string' },
                                                url: { type: 'string' },
                                                altText: { type: 'string' },
                                                sortOrder: { type: 'integer' },
                                                isMain: { type: 'boolean' },
                                                createdAt: { type: 'string', format: 'date-time' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Nenhuma imagem enviada ou dados inválidos' },
                    '404': { description: 'Produto não encontrado' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissões de admin' }
                }
            }
        },
        '/product-images/upload-multiple': {
            post: {
                summary: 'Upload múltiplo de imagens para produto (até 5)',
                tags: ['Imagens de Produtos'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['images', 'productId'],
                                properties: {
                                    images: {
                                        type: 'array',
                                        items: {
                                            type: 'string',
                                            format: 'binary'
                                        },
                                        maxItems: 5,
                                        description: 'Múltiplos ficheiros de imagem (máx 5 - JPEG, PNG, GIF, WebP - 5MB cada)'
                                    },
                                    productId: {
                                        type: 'string',
                                        format: 'uuid',
                                        description: 'ID do produto'
                                    },
                                    altText: {
                                        type: 'string',
                                        description: 'Texto alternativo base (será numerado automaticamente)'
                                    },
                                    sortOrder: {
                                        type: 'integer',
                                        minimum: 0,
                                        description: 'Ordem inicial (será incrementada para cada imagem)'
                                    },
                                    isMain: {
                                        type: 'boolean',
                                        description: 'Se a primeira imagem será a principal'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Imagens carregadas com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                count: { type: 'integer' },
                                                images: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            id: { type: 'string' },
                                                            productId: { type: 'string' },
                                                            url: { type: 'string' },
                                                            altText: { type: 'string' },
                                                            sortOrder: { type: 'integer' },
                                                            isMain: { type: 'boolean' }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Nenhuma imagem enviada ou dados inválidos' },
                    '404': { description: 'Produto não encontrado' }
                }
            }
        },
        '/product-images/reorder/{productId}': {
            put: {
                summary: 'Reordenar imagens de um produto',
                tags: ['Imagens de Produtos'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'productId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid' }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    required: ['id', 'sortOrder'],
                                    properties: {
                                        id: {
                                            type: 'string',
                                            format: 'uuid',
                                            description: 'ID da imagem'
                                        },
                                        sortOrder: {
                                            type: 'integer',
                                            minimum: 0,
                                            description: 'Nova ordem'
                                        }
                                    }
                                },
                                example: [
                                    { "id": "img1-uuid", "sortOrder": 0 },
                                    { "id": "img2-uuid", "sortOrder": 1 },
                                    { "id": "img3-uuid", "sortOrder": 2 }
                                ]
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Ordem das imagens atualizada com sucesso' },
                    '400': { description: 'Dados inválidos' },
                    '404': { description: 'Produto não encontrado' }
                }
            }
        },
        '/product-images': {
            post: {
                summary: 'Criar imagem por URL',
                tags: ['Imagens de Produtos'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['productId', 'url'],
                                properties: {
                                    productId: { type: 'string', format: 'uuid' },
                                    url: { type: 'string', format: 'url' },
                                    altText: { type: 'string' },
                                    sortOrder: { type: 'integer', minimum: 0 },
                                    isMain: { type: 'boolean' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Imagem criada com sucesso' }
                }
            }
        },
        '/product-images/{id}': {
            put: {
                summary: 'Atualizar imagem',
                tags: ['Imagens de Produtos'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID da imagem' }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    url: { type: 'string', format: 'url', description: 'Nova URL da imagem' },
                                    altText: { type: 'string', description: 'Texto alternativo' },
                                    sortOrder: { type: 'integer', minimum: 0, description: 'Ordem de exibição' },
                                    isMain: { type: 'boolean', description: 'Se é a imagem principal' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Imagem atualizada com sucesso' },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' },
                    '404': { description: 'Imagem não encontrada' },
                    '500': { description: 'Erro interno do servidor' }
                }
            },
            delete: {
                summary: 'Apagar imagem',
                tags: ['Imagens de Produtos'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID da imagem' }
                ],
                responses: {
                    '200': { description: 'Imagem eliminada com sucesso' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' },
                    '404': { description: 'Imagem não encontrada' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/product-images/{id}/main': {
            put: {
                summary: 'Definir imagem como principal',
                tags: ['Imagens de Produtos'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID da imagem' }
                ],
                responses: {
                    '200': { description: 'Imagem definida como principal com sucesso' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' },
                    '404': { description: 'Imagem não encontrada' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },

        // === CATEGORIAS EXPANDIDO ===
        '/categories/{id}': {
            get: {
                summary: 'Obter categoria por ID',
                tags: ['Categorias'],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Detalhes da categoria' }
                }
            },
            put: {
                summary: 'Atualizar categoria',
                tags: ['Categorias'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Categoria atualizada com sucesso' }
                }
            },
            delete: {
                summary: 'Excluir categoria',
                tags: ['Categorias'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Categoria excluída com sucesso' }
                }
            }
        },

        // === COLEÇÕES EXPANDIDO ===
        '/collections/{id}': {
            get: {
                summary: 'Obter coleção por ID',
                tags: ['Coleções'],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Detalhes da coleção' },
                    '404': { description: 'Coleção não encontrada' }
                }
            },
            put: {
                summary: 'Atualizar coleção',
                tags: ['Coleções'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    season: { type: 'string' },
                                    year: { type: 'integer' },
                                    launchDate: { type: 'string', format: 'date-time' },
                                    isActive: { type: 'boolean' },
                                    isFeatured: { type: 'boolean' },
                                    coverImage: { type: 'string' },
                                    slug: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Coleção atualizada com sucesso' },
                    '404': { description: 'Coleção não encontrada' },
                    '409': { description: 'Nome ou slug já existe' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            },
            delete: {
                summary: 'Excluir coleção',
                tags: ['Coleções'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Coleção excluída com sucesso' },
                    '404': { description: 'Coleção não encontrada' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },
        '/collections/{id}/toggle-featured': {
            post: {
                summary: 'Alternar status de destaque da coleção',
                tags: ['Coleções'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Status alterado' },
                    '404': { description: 'Coleção não encontrada' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },
        '/collections/{id}/products': {
            get: {
                summary: 'Obter produtos da coleção',
                tags: ['Coleções'],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
                ],
                responses: {
                    '200': { description: 'Produtos da coleção' },
                    '404': { description: 'Coleção não encontrada' }
                }
            }
        },
        '/collections/{collectionId}/products': {
            post: {
                summary: 'Adicionar produto à coleção',
                tags: ['Coleções'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'collectionId', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['productId'],
                                properties: {
                                    productId: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Produto adicionado à coleção' },
                    '404': { description: 'Coleção ou produto não encontrado' },
                    '409': { description: 'Produto já está na coleção' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },
        '/collections/{collectionId}/products/{productId}': {
            delete: {
                summary: 'Remover produto da coleção',
                tags: ['Coleções'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'collectionId', in: 'path', required: true, schema: { type: 'string' } },
                    { name: 'productId', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Produto removido da coleção' },
                    '404': { description: 'Produto não está na coleção' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },

        // === FORNECEDORES EXPANDIDO ===
        '/suppliers/{id}': {
            get: {
                summary: 'Obter fornecedor por ID',
                tags: ['Fornecedores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Detalhes do fornecedor' },
                    '404': { description: 'Fornecedor não encontrado' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            },
            put: {
                summary: 'Atualizar fornecedor',
                tags: ['Fornecedores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    contactName: { type: 'string' },
                                    email: { type: 'string', format: 'email' },
                                    phone: { type: 'string' },
                                    address: { type: 'string' },
                                    city: { type: 'string' },
                                    country: { type: 'string' },
                                    postalCode: { type: 'string' },
                                    taxNumber: { type: 'string' },
                                    website: { type: 'string', format: 'uri' },
                                    notes: { type: 'string' },
                                    isActive: { type: 'boolean' },
                                    paymentTerms: { type: 'string' },
                                    currency: { type: 'string', minLength: 3, maxLength: 3 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Fornecedor atualizado com sucesso' },
                    '404': { description: 'Fornecedor não encontrado' },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            },
            delete: {
                summary: 'Excluir fornecedor',
                tags: ['Fornecedores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Fornecedor excluído com sucesso' },
                    '404': { description: 'Fornecedor não encontrado' },
                    '400': { description: 'Fornecedor tem encomendas ativas' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },
        '/suppliers/{id}/toggle-status': {
            post: {
                summary: 'Alternar status do fornecedor',
                tags: ['Fornecedores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Status alterado' },
                    '404': { description: 'Fornecedor não encontrado' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },

        // === PEDIDOS DE FORNECEDORES EXPANDIDO ===
        '/supplier-orders/{id}': {
            get: {
                summary: 'Obter encomenda por ID',
                tags: ['Pedidos de Fornecedores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Detalhes da encomenda' },
                    '404': { description: 'Encomenda não encontrada' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            },
            put: {
                summary: 'Atualizar encomenda',
                tags: ['Pedidos de Fornecedores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', enum: ['PENDENTE', 'ENVIADA', 'RECEBIDA', 'CANCELADA'] },
                                    expectedDate: { type: 'string', format: 'date-time' },
                                    receivedDate: { type: 'string', format: 'date-time' },
                                    notes: { type: 'string' },
                                    invoiceNumber: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Encomenda atualizada' },
                    '404': { description: 'Encomenda não encontrada' },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            },
            delete: {
                summary: 'Deletar encomenda',
                tags: ['Pedidos de Fornecedores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Encomenda deletada' },
                    '404': { description: 'Encomenda não encontrada' },
                    '400': { description: 'Não é possível deletar encomenda que não está pendente' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },
        '/supplier-orders/{id}/mark-sent': {
            post: {
                summary: 'Marcar encomenda como enviada',
                tags: ['Pedidos de Fornecedores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Encomenda marcada como enviada' },
                    '404': { description: 'Encomenda não encontrada' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },
        '/supplier-orders/{id}/mark-received': {
            post: {
                summary: 'Marcar encomenda como recebida',
                tags: ['Pedidos de Fornecedores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Encomenda marcada como recebida' },
                    '404': { description: 'Encomenda não encontrada' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },
        '/supplier-orders/{id}/items/{itemId}': {
            put: {
                summary: 'Atualizar item da encomenda',
                tags: ['Pedidos de Fornecedores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                    { name: 'itemId', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    receivedQuantity: { type: 'integer', minimum: 0 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Item atualizado' },
                    '404': { description: 'Encomenda ou item não encontrado' },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas Admin)' }
                }
            }
        },

        // === LISTA DE DESEJOS ===
        '/wishlist': {
            get: {
                summary: 'Obter lista de desejos do utilizador',
                tags: ['Lista de Desejos'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Lista de desejos obtida com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'string' },
                                                    userId: { type: 'string' },
                                                    productId: { type: 'string' },
                                                    product: {
                                                        type: 'object',
                                                        properties: {
                                                            id: { type: 'string' },
                                                            name: { type: 'string' },
                                                            price: { type: 'number' },
                                                            images: { type: 'array' }
                                                        }
                                                    },
                                                    addedAt: { type: 'string', format: 'date-time' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '401': { description: 'Não autenticado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            },
            post: {
                summary: 'Adicionar produto à lista de desejos',
                tags: ['Lista de Desejos'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['productId'],
                                properties: {
                                    productId: { type: 'string', description: 'ID do produto a adicionar' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Produto adicionado à lista de desejos com sucesso' },
                    '400': { description: 'Dados inválidos ou produto já na lista' },
                    '401': { description: 'Não autenticado' },
                    '404': { description: 'Produto não encontrado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/wishlist/{productId}': {
            delete: {
                summary: 'Remover produto da lista de desejos',
                tags: ['Lista de Desejos'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'productId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID do produto a ser removido'
                    }
                ],
                responses: {
                    '200': { description: 'Produto removido da lista de desejos com sucesso' },
                    '400': { description: 'ID do produto inválido' },
                    '401': { description: 'Não autenticado' },
                    '404': { description: 'Produto não encontrado na lista de desejos' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/wishlist/move-to-cart': {
            post: {
                summary: 'Mover item da lista de desejos para o carrinho',
                tags: ['Lista de Desejos'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['productId'],
                                properties: {
                                    productId: { type: 'string', description: 'ID do produto a mover para o carrinho' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Item movido para o carrinho com sucesso' },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autenticado' },
                    '404': { description: 'Produto não encontrado na lista de desejos' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },

        // === UPLOAD ===
        '/upload/proof': {
            post: {
                summary: 'Upload de comprovativo de pagamento/licença',
                tags: ['Upload'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['file'],
                                properties: {
                                    file: {
                                        type: 'string',
                                        format: 'binary',
                                        description: 'Ficheiro de comprovativo (imagem: JPEG/PNG ou PDF - máx 5MB)'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Comprovativo enviado com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string', description: 'Mensagem de sucesso' },
                                        fileUrl: { type: 'string', description: 'URL relativa do ficheiro carregado' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Nenhum ficheiro enviado, formato inválido ou ficheiro muito grande' },
                    '401': { description: 'Não autenticado (token JWT obrigatório)' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },

        // === PERMISSÕES ===
        '/api/admin/permissions': {
            get: {
                summary: 'Listar permissões',
                tags: ['Permissões'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Lista de permissões',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string' },
                                            name: { type: 'string', example: 'EDIT_PRODUCTS' },
                                            createdAt: { type: 'string', format: 'date-time' },
                                            updatedAt: { type: 'string', format: 'date-time' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas ADMIN)' }
                }
            },
            post: {
                summary: 'Criar permissão',
                tags: ['Permissões'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name'],
                                properties: {
                                    name: {
                                        type: 'string',
                                        description: 'Nome da permissão',
                                        example: 'EDIT_PRODUCTS'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Permissão criada com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        name: { type: 'string' },
                                        createdAt: { type: 'string', format: 'date-time' },
                                        updatedAt: { type: 'string', format: 'date-time' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas ADMIN)' }
                }
            }
        },
        '/api/admin/groups': {
            get: {
                summary: 'Listar grupos de utilizadores',
                tags: ['Grupos'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Lista de grupos',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string' },
                                            name: { type: 'string', example: 'Admins' },
                                            createdAt: { type: 'string', format: 'date-time' },
                                            updatedAt: { type: 'string', format: 'date-time' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas ADMIN)' }
                }
            },
            post: {
                summary: 'Criar grupo de utilizadores',
                tags: ['Grupos'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name'],
                                properties: {
                                    name: {
                                        type: 'string',
                                        description: 'Nome do grupo',
                                        example: 'Admins'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Grupo criado com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        name: { type: 'string' },
                                        createdAt: { type: 'string', format: 'date-time' },
                                        updatedAt: { type: 'string', format: 'date-time' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas ADMIN)' }
                }
            }
        },
        '/api/admin/permissions/add-to-user': {
            post: {
                summary: 'Associar permissão a utilizador',
                tags: ['Permissões'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['userId', 'permissionId'],
                                properties: {
                                    userId: {
                                        type: 'string',
                                        description: 'ID do utilizador',
                                        example: 'clx123abc'
                                    },
                                    permissionId: {
                                        type: 'string',
                                        description: 'ID da permissão',
                                        example: 'perm456def'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Permissão associada ao utilizador com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        email: { type: 'string' },
                                        permissions: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'string' },
                                                    name: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas ADMIN)' },
                    '404': { description: 'Utilizador ou permissão não encontrado' }
                }
            }
        },
        '/api/admin/groups/add-user': {
            post: {
                summary: 'Associar utilizador a grupo',
                tags: ['Grupos'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['userId', 'groupId'],
                                properties: {
                                    userId: {
                                        type: 'string',
                                        description: 'ID do utilizador',
                                        example: 'clx123abc'
                                    },
                                    groupId: {
                                        type: 'string',
                                        description: 'ID do grupo',
                                        example: 'group789xyz'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Utilizador associado ao grupo com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        email: { type: 'string' },
                                        groupId: { type: 'string' },
                                        group: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string' },
                                                name: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas ADMIN)' },
                    '404': { description: 'Utilizador ou grupo não encontrado' }
                }
            }
        },

        // === GUIAS DE TAMANHO ===
        '/size-guides': {
            get: {
                summary: 'Listar guias de tamanho',
                tags: ['Guias de Tamanho'],
                parameters: [
                    {
                        name: 'categoryId',
                        in: 'query',
                        required: false,
                        schema: { type: 'string', format: 'uuid' },
                        description: 'Filtrar por categoria específica'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Lista de guias de tamanho',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'string' },
                                                    name: { type: 'string', example: 'Guia Feminino Adulto' },
                                                    categoryId: { type: 'string' },
                                                    sizes: {
                                                        type: 'object',
                                                        example: {
                                                            'XS': { bust: 82, waist: 64, hip: 90 },
                                                            'S': { bust: 86, waist: 68, hip: 94 }
                                                        }
                                                    },
                                                    unit: { type: 'string', example: 'cm' },
                                                    notes: { type: 'string' },
                                                    category: {
                                                        type: 'object',
                                                        properties: {
                                                            id: { type: 'string' },
                                                            name: { type: 'string' }
                                                        }
                                                    },
                                                    createdAt: { type: 'string', format: 'date-time' },
                                                    updatedAt: { type: 'string', format: 'date-time' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '500': { description: 'Erro interno do servidor' }
                }
            },
            post: {
                summary: 'Criar guia de tamanho',
                tags: ['Guias de Tamanho'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['categoryId', 'name', 'sizes'],
                                properties: {
                                    categoryId: {
                                        type: 'string',
                                        format: 'uuid',
                                        description: 'ID da categoria'
                                    },
                                    name: {
                                        type: 'string',
                                        description: 'Nome do guia',
                                        example: 'Guia Feminino Adulto'
                                    },
                                    sizes: {
                                        type: 'object',
                                        description: 'Tamanhos e medidas',
                                        example: {
                                            'XS': { bust: 82, waist: 64, hip: 90 },
                                            'S': { bust: 86, waist: 68, hip: 94 },
                                            'M': { bust: 90, waist: 72, hip: 98 }
                                        }
                                    },
                                    unit: {
                                        type: 'string',
                                        default: 'cm',
                                        description: 'Unidade de medida'
                                    },
                                    notes: {
                                        type: 'string',
                                        description: 'Notas adicionais'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Guia criado com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string' },
                                                name: { type: 'string' },
                                                categoryId: { type: 'string' },
                                                sizes: { type: 'object' },
                                                unit: { type: 'string' },
                                                notes: { type: 'string' },
                                                createdAt: { type: 'string', format: 'date-time' },
                                                updatedAt: { type: 'string', format: 'date-time' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Dados inválidos ou guia duplicado' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas ADMIN)' },
                    '404': { description: 'Categoria não encontrada' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/size-guides/{id}': {
            get: {
                summary: 'Obter guia de tamanho por ID',
                tags: ['Guias de Tamanho'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID do guia de tamanho'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Guia de tamanho encontrado',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string' },
                                                name: { type: 'string' },
                                                categoryId: { type: 'string' },
                                                sizes: { type: 'object' },
                                                unit: { type: 'string' },
                                                notes: { type: 'string' },
                                                category: {
                                                    type: 'object',
                                                    properties: {
                                                        id: { type: 'string' },
                                                        name: { type: 'string' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '404': { description: 'Guia de tamanhos não encontrado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            },
            put: {
                summary: 'Atualizar guia de tamanho',
                tags: ['Guias de Tamanho'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID do guia de tamanho'
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string',
                                        description: 'Nome do guia'
                                    },
                                    sizes: {
                                        type: 'object',
                                        description: 'Tamanhos e medidas atualizadas'
                                    },
                                    unit: {
                                        type: 'string',
                                        description: 'Unidade de medida'
                                    },
                                    notes: {
                                        type: 'string',
                                        description: 'Notas adicionais'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Guia atualizado com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { type: 'object' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Dados inválidos ou nome duplicado' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas ADMIN)' },
                    '404': { description: 'Guia não encontrado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            },
            delete: {
                summary: 'Eliminar guia de tamanho',
                tags: ['Guias de Tamanho'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID do guia de tamanho'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Guia eliminado com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas ADMIN)' },
                    '404': { description: 'Guia não encontrado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/size-guides/category/{categoryId}': {
            get: {
                summary: 'Obter guias de tamanho por categoria',
                tags: ['Guias de Tamanho'],
                parameters: [
                    {
                        name: 'categoryId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                        description: 'ID da categoria'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Guias de tamanho da categoria',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: { type: 'object' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/size-guides/recommendation/{categoryId}': {
            get: {
                summary: 'Obter recomendação de tamanho baseada em medidas',
                tags: ['Guias de Tamanho'],
                parameters: [
                    {
                        name: 'categoryId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                        description: 'ID da categoria'
                    },
                    {
                        name: 'bust',
                        in: 'query',
                        required: false,
                        schema: { type: 'number' },
                        description: 'Medida do busto em cm'
                    },
                    {
                        name: 'waist',
                        in: 'query',
                        required: false,
                        schema: { type: 'number' },
                        description: 'Medida da cintura em cm'
                    },
                    {
                        name: 'hip',
                        in: 'query',
                        required: false,
                        schema: { type: 'number' },
                        description: 'Medida da anca em cm'
                    },
                    {
                        name: 'chest',
                        in: 'query',
                        required: false,
                        schema: { type: 'number' },
                        description: 'Medida do peito em cm'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Recomendações de tamanho',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    guideId: { type: 'string' },
                                                    guideName: { type: 'string' },
                                                    recommendedSize: { type: 'string', example: 'M' },
                                                    confidence: { type: 'number', example: 85.5 }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Pelo menos uma medida é obrigatória' },
                    '404': { description: 'Nenhum guia encontrado para esta categoria' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },

        // === FATURAS ===
        '/invoices/{id}': {
            get: {
                summary: 'Download de fatura específica',
                tags: ['Faturas'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID da fatura/pedido'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Fatura baixada com sucesso',
                        content: {
                            'application/pdf': {
                                schema: {
                                    type: 'string',
                                    format: 'binary',
                                    description: 'Ficheiro PDF da fatura'
                                }
                            }
                        },
                        headers: {
                            'Content-Disposition': {
                                description: 'Nome do ficheiro para download',
                                schema: { type: 'string', example: 'attachment; filename="invoice_123.pdf"' }
                            }
                        }
                    },
                    '400': { description: 'ID da fatura inválido' },
                    '401': { description: 'Não autenticado' },
                    '404': { description: 'Fatura não encontrada' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/invoices/download/all': {
            get: {
                summary: 'Download de todas as faturas do utilizador',
                tags: ['Faturas'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Todas as faturas baixadas em ZIP',
                        content: {
                            'application/zip': {
                                schema: {
                                    type: 'string',
                                    format: 'binary',
                                    description: 'Ficheiro ZIP com todas as faturas'
                                }
                            }
                        },
                        headers: {
                            'Content-Disposition': {
                                description: 'Nome do ficheiro ZIP',
                                schema: { type: 'string', example: 'attachment; filename="meus_ficheiros.zip"' }
                            }
                        }
                    },
                    '401': { description: 'Não autenticado' },
                    '404': { description: 'Nenhuma fatura encontrada para este utilizador' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },

        // === AUDITORIA ===
        '/admin/audit-logs': {
            get: {
                summary: 'Obter todos os logs de auditoria do sistema',
                tags: ['Auditoria'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'take',
                        in: 'query',
                        required: false,
                        schema: { type: 'integer', default: 50, minimum: 1, maximum: 100 },
                        description: 'Número máximo de logs a retornar'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Lista de logs de auditoria obtida com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string' },
                                            userId: { type: 'string' },
                                            action: { type: 'string', example: 'CREATE' },
                                            entity: { type: 'string', example: 'Product' },
                                            entityId: { type: 'string' },
                                            createdAt: { type: 'string', format: 'date-time' },
                                            user: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'string' },
                                                    email: { type: 'string' },
                                                    name: { type: 'string' },
                                                    role: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas ADMIN)' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/admin/audit-logs/user': {
            get: {
                summary: 'Obter logs de auditoria do utilizador autenticado',
                tags: ['Auditoria'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Logs de auditoria do utilizador obtidos com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string' },
                                            userId: { type: 'string' },
                                            action: { type: 'string', example: 'UPDATE' },
                                            entity: { type: 'string', example: 'Order' },
                                            entityId: { type: 'string' },
                                            createdAt: { type: 'string', format: 'date-time' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '401': { description: 'Não autenticado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/admin/audit-logs/user/{userId}': {
            get: {
                summary: 'Obter logs de auditoria de utilizador específico (Admin)',
                tags: ['Auditoria'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'userId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID do utilizador'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Logs de auditoria do utilizador obtidos com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string' },
                                            userId: { type: 'string' },
                                            action: { type: 'string', example: 'DELETE' },
                                            entity: { type: 'string', example: 'Review' },
                                            entityId: { type: 'string' },
                                            createdAt: { type: 'string', format: 'date-time' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'ID de utilizador inválido' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão (apenas ADMIN)' },
                    '404': { description: 'Utilizador não encontrado' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },

        // === WEBHOOKS ===
        '/webhook': {
            post: {
                summary: 'Receber webhook',
                tags: ['Webhooks'],
                responses: {
                    '200': { description: 'Webhook processado' }
                }
            }
        },

        // === DASHBOARD ===
        '/dashboard/stats': {
            get: {
                summary: 'Estatísticas do dashboard',
                tags: ['Dashboard'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Estatísticas do dashboard',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/DashboardStats' }
                            }
                        }
                    }
                }
            }
        },
        '/dashboard/live': {
            get: {
                summary: 'Stream de atualizações do dashboard',
                tags: ['Dashboard'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Conexão SSE estabelecida',
                        content: {
                            'text/event-stream': {
                                schema: {
                                    type: 'string',
                                    description: 'Stream de eventos no formato SSE'
                                }
                            }
                        }
                    }
                }
            }
        },
        '/dashboard/trigger-update': {
            post: {
                summary: 'Disparar atualização do dashboard',
                tags: ['Dashboard'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Atualização disparada com sucesso' }
                }
            }
        },
        '/dashboard/websocket-test': {
            post: {
                summary: 'Teste WebSocket',
                tags: ['Dashboard'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Teste WebSocket realizado' }
                }
            }
        },
        '/dashboard/all-metrics': {
            get: {
                summary: 'Todas as métricas do dashboard',
                tags: ['Dashboard'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Todas as métricas obtidas com sucesso' }
                }
            }
        },
        '/dashboard/finance/metrics': {
            get: {
                summary: 'Métricas financeiras',
                tags: ['Dashboard'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Métricas financeiras obtidas' }
                }
            }
        },
        '/dashboard/overview/metrics': {
            get: {
                summary: 'Métricas de visão geral',
                tags: ['Dashboard'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Métricas de visão geral obtidas' }
                }
            }
        },

        // === TELEGRAM NOTIFICATIONS ===
        '/telegram/test/system': {
            post: {
                summary: 'Teste do sistema Telegram',
                tags: ['Telegram'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Notificação de teste enviada com sucesso' }
                }
            }
        },
        '/telegram/test/error': {
            post: {
                summary: 'Teste de notificação de erro',
                tags: ['Telegram'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string', enum: ['server_error', 'client_error'] },
                                    message: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Notificação de erro enviada com sucesso' }
                }
            }
        },
        '/telegram/test/order': {
            post: {
                summary: 'Teste de notificação de encomenda',
                tags: ['Telegram'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Notificação de encomenda de teste enviada' }
                }
            }
        },
        '/telegram/test/custom': {
            post: {
                summary: 'Enviar mensagem personalizada',
                tags: ['Telegram'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['message'],
                                properties: {
                                    message: { type: 'string' },
                                    chatId: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Mensagem personalizada enviada' }
                }
            }
        },
        '/telegram/test/simulate/client-error': {
            post: {
                summary: 'Simular erro de cliente',
                tags: ['Telegram'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '401': { description: 'Erro de cliente simulado' }
                }
            }
        },
        '/telegram/test/simulate/server-error': {
            post: {
                summary: 'Simular erro de servidor',
                tags: ['Telegram'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '500': { description: 'Erro de servidor simulado' }
                }
            }
        },

        // === FILTER ENDPOINTS (MISSING) ===
        '/filter/options': {
            get: {
                summary: 'Obter opções de filtro disponíveis',
                tags: ['Filter'],
                responses: {
                    '200': {
                        description: 'Opções de filtro obtidas com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                categories: { type: 'array' },
                                                colors: { type: 'array' },
                                                sizes: { type: 'array' },
                                                materials: { type: 'array' },
                                                styles: { type: 'array' },
                                                occasions: { type: 'array' },
                                                seasons: { type: 'array' },
                                                genders: { type: 'array' },
                                                tags: { type: 'array' },
                                                priceRange: {
                                                    type: 'object',
                                                    properties: {
                                                        min: { type: 'number' },
                                                        max: { type: 'number' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/filter/products': {
            get: {
                summary: 'Filtrar produtos',
                tags: ['Filter'],
                parameters: [
                    { name: 'category', in: 'query', schema: { type: 'string' } },
                    { name: 'minPrice', in: 'query', schema: { type: 'number' } },
                    { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
                    { name: 'colors', in: 'query', schema: { type: 'array', items: { type: 'string' } } },
                    { name: 'sizes', in: 'query', schema: { type: 'array', items: { type: 'string' } } },
                    { name: 'materials', in: 'query', schema: { type: 'array', items: { type: 'string' } } },
                    { name: 'styles', in: 'query', schema: { type: 'array', items: { type: 'string' } } },
                    { name: 'occasions', in: 'query', schema: { type: 'array', items: { type: 'string' } } },
                    { name: 'seasons', in: 'query', schema: { type: 'array', items: { type: 'string' } } },
                    { name: 'gender', in: 'query', schema: { type: 'string' } },
                    { name: 'tags', in: 'query', schema: { type: 'array', items: { type: 'string' } } },
                    { name: 'inStock', in: 'query', schema: { type: 'boolean' } },
                    { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest', 'popular'] } },
                    { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } }
                ],
                responses: {
                    '200': {
                        description: 'Produtos filtrados obtidos com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                products: { type: 'array' },
                                                pagination: {
                                                    type: 'object',
                                                    properties: {
                                                        current: { type: 'integer' },
                                                        total: { type: 'integer' },
                                                        count: { type: 'integer' },
                                                        perPage: { type: 'integer' },
                                                        hasNext: { type: 'boolean' },
                                                        hasPrev: { type: 'boolean' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Parâmetros de filtro inválidos' }
                }
            }
        },
        '/filter/counts': {
            get: {
                summary: 'Obter contagens de filtros',
                tags: ['Filter'],
                parameters: [
                    { name: 'category', in: 'query', schema: { type: 'string' } },
                    { name: 'minPrice', in: 'query', schema: { type: 'number' } },
                    { name: 'maxPrice', in: 'query', schema: { type: 'number' } }
                ],
                responses: {
                    '200': {
                        description: 'Contagens de filtros obtidas com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                categories: { type: 'array' },
                                                colors: { type: 'array' },
                                                sizes: { type: 'array' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/filter/search': {
            get: {
                summary: 'Pesquisar produtos por texto',
                tags: ['Filter'],
                parameters: [
                    { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
                    { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } }
                ],
                responses: {
                    '200': {
                        description: 'Pesquisa de produtos realizada com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                products: { type: 'array' },
                                                searchTerm: { type: 'string' },
                                                pagination: {
                                                    type: 'object',
                                                    properties: {
                                                        current: { type: 'integer' },
                                                        total: { type: 'integer' },
                                                        count: { type: 'integer' },
                                                        perPage: { type: 'integer' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Termo de pesquisa deve ter pelo menos 2 caracteres' }
                }
            }
        },

        // === HEALTH CHECK ENDPOINTS ===
        '/health': {
            get: {
                summary: 'Health check detalhado do sistema',
                tags: ['Health'],
                responses: {
                    '200': {
                        description: 'Sistema saudável',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', enum: ['healthy', 'unhealthy'] },
                                        timestamp: { type: 'string', format: 'date-time' },
                                        uptime: { type: 'number' },
                                        version: { type: 'string' },
                                        services: {
                                            type: 'object',
                                            properties: {
                                                database: {
                                                    type: 'object',
                                                    properties: {
                                                        status: { type: 'string', enum: ['connected', 'disconnected'] },
                                                        responseTime: { type: 'number' }
                                                    }
                                                },
                                                redis: {
                                                    type: 'object',
                                                    properties: {
                                                        status: { type: 'string', enum: ['connected', 'disconnected'] },
                                                        responseTime: { type: 'number' }
                                                    }
                                                }
                                            }
                                        },
                                        memory: {
                                            type: 'object',
                                            properties: {
                                                used: { type: 'number' },
                                                total: { type: 'number' },
                                                percentage: { type: 'number' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '503': { description: 'Sistema com problemas' }
                }
            }
        },
        '/health/simple': {
            get: {
                summary: 'Health check simples para load balancers',
                tags: ['Health'],
                responses: {
                    '200': {
                        description: 'Sistema funcionando',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', example: 'OK' }
                                    }
                                }
                            }
                        }
                    },
                    '503': { description: 'Sistema com problemas' }
                }
            }
        },
        // === NEWSLETTER ===
        '/newsletter/subscribe': {
            post: {
                summary: 'Subscrever newsletter',
                tags: ['Newsletter'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { '$ref': '#/components/schemas/NewsletterSubscribeRequest' }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Subscrito com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: { '$ref': '#/components/schemas/NewsletterSubscriber' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Dados inválidos' },
                    '409': { description: 'Email já subscrito' }
                }
            }
        },
        '/newsletter/unsubscribe': {
            post: {
                summary: 'Cancelar subscrição da newsletter',
                tags: ['Newsletter'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    token: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Subscrição cancelada com sucesso' },
                    '400': { description: 'Email ou token necessário' },
                    '404': { description: 'Subscritor não encontrado' }
                }
            }
        },
        '/newsletter/preferences': {
            put: {
                summary: 'Atualizar preferências da newsletter',
                tags: ['Newsletter'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'preferences'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    preferences: { type: 'object' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Preferências atualizadas com sucesso' },
                    '400': { description: 'Dados inválidos' },
                    '404': { description: 'Subscritor não encontrado' }
                }
            }
        },
        '/newsletter/subscribers': {
            get: {
                summary: 'Listar subscritores (Admin)',
                tags: ['Newsletter - Admin'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'page',
                        in: 'query',
                        schema: { type: 'integer', default: 1 }
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        schema: { type: 'integer', default: 20 }
                    },
                    {
                        name: 'search',
                        in: 'query',
                        schema: { type: 'string' }
                    },
                    {
                        name: 'isActive',
                        in: 'query',
                        schema: { type: 'boolean' }
                    },
                    {
                        name: 'source',
                        in: 'query',
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Lista de subscritores',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                subscribers: {
                                                    type: 'array',
                                                    items: { '$ref': '#/components/schemas/NewsletterSubscriber' }
                                                },
                                                pagination: {
                                                    type: 'object',
                                                    properties: {
                                                        page: { type: 'integer' },
                                                        limit: { type: 'integer' },
                                                        total: { type: 'integer' },
                                                        totalPages: { type: 'integer' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão' }
                }
            }
        },
        '/newsletter/campaigns': {
            get: {
                summary: 'Listar campanhas (Admin)',
                tags: ['Newsletter - Admin'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'page',
                        in: 'query',
                        schema: { type: 'integer', default: 1 }
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        schema: { type: 'integer', default: 20 }
                    },
                    {
                        name: 'status',
                        in: 'query',
                        schema: { type: 'string' }
                    },
                    {
                        name: 'type',
                        in: 'query',
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Lista de campanhas',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                campaigns: {
                                                    type: 'array',
                                                    items: { '$ref': '#/components/schemas/NewsletterCampaign' }
                                                },
                                                pagination: { type: 'object' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão' }
                }
            },
            post: {
                summary: 'Criar campanha (Admin)',
                tags: ['Newsletter - Admin'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { '$ref': '#/components/schemas/NewsletterCampaignRequest' }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Campanha criada com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: { '$ref': '#/components/schemas/NewsletterCampaign' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão' }
                }
            }
        },
        '/newsletter/campaigns/{id}': {
            get: {
                summary: 'Detalhes da campanha (Admin)',
                tags: ['Newsletter - Admin'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Detalhes da campanha',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { '$ref': '#/components/schemas/NewsletterCampaign' }
                                    }
                                }
                            }
                        }
                    },
                    '404': { description: 'Campanha não encontrada' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão' }
                }
            }
        },
        '/newsletter/campaigns/{id}/send': {
            post: {
                summary: 'Enviar campanha (Admin)',
                tags: ['Newsletter - Admin'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Campanha enviada com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                sentCount: { type: 'integer' },
                                                errorCount: { type: 'integer' },
                                                totalSubscribers: { type: 'integer' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Campanha não pode ser enviada no estado atual' },
                    '404': { description: 'Campanha não encontrada' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão' }
                }
            }
        },
        '/newsletter/campaigns/{id}/cancel': {
            post: {
                summary: 'Cancelar campanha (Admin)',
                tags: ['Newsletter - Admin'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': { description: 'Campanha cancelada com sucesso' },
                    '400': { description: 'Campanha não pode ser cancelada' },
                    '404': { description: 'Campanha não encontrada' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão' }
                }
            }
        },
        '/newsletter/campaigns/{id}/stats': {
            get: {
                summary: 'Estatísticas da campanha (Admin)',
                tags: ['Newsletter - Admin'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Estatísticas da campanha',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { '$ref': '#/components/schemas/NewsletterCampaignStats' }
                                    }
                                }
                            }
                        }
                    },
                    '404': { description: 'Campanha não encontrada' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão' }
                }
            }
        },
        '/newsletter/templates': {
            get: {
                summary: 'Listar templates (Admin)',
                tags: ['Newsletter - Admin'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'type',
                        in: 'query',
                        schema: { type: 'string' }
                    },
                    {
                        name: 'isActive',
                        in: 'query',
                        schema: { type: 'boolean', default: true }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Lista de templates',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: { '$ref': '#/components/schemas/NewsletterTemplate' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão' }
                }
            },
            post: {
                summary: 'Criar template (Admin)',
                tags: ['Newsletter - Admin'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'content'],
                                properties: {
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    content: { type: 'string' },
                                    variables: { type: 'object' },
                                    type: {
                                        type: 'string',
                                        enum: ['GENERAL', 'WELCOME', 'PROMOTIONAL', 'NEW_ARRIVALS', 'ABANDONED_CART', 'WIN_BACK', 'SEASONAL'],
                                        default: 'GENERAL'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Template criado com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: { '$ref': '#/components/schemas/NewsletterTemplate' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão' }
                }
            }
        },
        '/newsletter/templates/{id}': {
            put: {
                summary: 'Atualizar template (Admin)',
                tags: ['Newsletter - Admin'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    content: { type: 'string' },
                                    variables: { type: 'object' },
                                    type: { type: 'string' },
                                    isActive: { type: 'boolean' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Template atualizado com sucesso' },
                    '400': { description: 'Dados inválidos' },
                    '404': { description: 'Template não encontrado' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão' }
                }
            },
            delete: {
                summary: 'Remover template (Admin)',
                tags: ['Newsletter - Admin'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': { description: 'Template removido com sucesso' },
                    '404': { description: 'Template não encontrado' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão' }
                }
            }
        },
        '/newsletter/tags': {
            get: {
                summary: 'Listar tags (Admin)',
                tags: ['Newsletter - Admin'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Lista de tags',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: { '$ref': '#/components/schemas/NewsletterTag' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão' }
                }
            },
            post: {
                summary: 'Criar tag (Admin)',
                tags: ['Newsletter - Admin'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name'],
                                properties: {
                                    name: { type: 'string' },
                                    color: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Tag criada com sucesso' },
                    '400': { description: 'Dados inválidos' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão' }
                }
            }
        },
        '/newsletter/tags/{id}': {
            put: {
                summary: 'Atualizar tag (Admin)',
                tags: ['Newsletter - Admin'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    color: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Tag atualizada com sucesso' },
                    '400': { description: 'Dados inválidos' },
                    '404': { description: 'Tag não encontrada' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão' }
                }
            },
            delete: {
                summary: 'Remover tag (Admin)',
                tags: ['Newsletter - Admin'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': { description: 'Tag removida com sucesso' },
                    '404': { description: 'Tag não encontrada' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão' }
                }
            }
        },
        '/newsletter/subscribers/{subscriberId}/tags/{tagId}': {
            post: {
                summary: 'Adicionar tag ao subscritor (Admin)',
                tags: ['Newsletter - Admin'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'subscriberId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        name: 'tagId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': { description: 'Tag adicionada ao subscritor com sucesso' },
                    '409': { description: 'Tag já atribuída ao subscritor' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão' }
                }
            },
            delete: {
                summary: 'Remover tag do subscritor (Admin)',
                tags: ['Newsletter - Admin'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'subscriberId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        name: 'tagId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': { description: 'Tag removida do subscritor com sucesso' },
                    '404': { description: 'Tag não encontrada no subscritor' },
                    '401': { description: 'Não autenticado' },
                    '403': { description: 'Sem permissão' }
                }
            }
        },
        '/newsletter/track/open/{campaignId}/{subscriberId}': {
            get: {
                summary: 'Tracking de abertura de email (público)',
                tags: ['Newsletter - Tracking'],
                parameters: [
                    {
                        name: 'campaignId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        name: 'subscriberId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Pixel de tracking 1x1',
                        content: {
                            'image/gif': {
                                schema: { type: 'string', format: 'binary' }
                            }
                        }
                    }
                }
            }
        },
        '/newsletter/track/click/{campaignId}/{subscriberId}': {
            get: {
                summary: 'Tracking de clique em email (público)',
                tags: ['Newsletter - Tracking'],
                parameters: [
                    {
                        name: 'campaignId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        name: 'subscriberId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        name: 'url',
                        in: 'query',
                        schema: { type: 'string' },
                        description: 'URL para onde redirecionar após tracking'
                    }
                ],
                responses: {
                    '302': { description: 'Redirecionamento para URL de destino' },
                    '200': { description: 'Clique registado com sucesso' }
                }
            }
        }
    }
};

export const swaggerSpec = swaggerDefinition;