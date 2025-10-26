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
                responses: {
                    '200': { description: 'Lista de coleções' }
                }
            },
            post: {
                summary: 'Criar coleção',
                tags: ['Coleções'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '201': { description: 'Coleção criada com sucesso' }
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
                    }
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
                    '200': { description: 'Item adicionado ao carrinho' }
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
                    '200': { description: 'Item atualizado no carrinho' }
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
                    '200': { description: 'Item removido do carrinho' }
                }
            }
        },
        '/cart/clear': {
            delete: {
                summary: 'Limpar todo o carrinho',
                tags: ['Carrinho'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Carrinho limpo com sucesso' }
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
                responses: {
                    '200': {
                        description: 'Lista de fornecedores',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Supplier' }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                summary: 'Criar fornecedor',
                tags: ['Fornecedores'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '201': { description: 'Fornecedor criado com sucesso' }
                }
            }
        },

        // === PEDIDOS DE FORNECEDORES ===
        '/supplier-orders': {
            get: {
                summary: 'Listar pedidos de fornecedores',
                tags: ['Pedidos de Fornecedores'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Lista de pedidos de fornecedores' }
                }
            },
            post: {
                summary: 'Criar pedido para fornecedor',
                tags: ['Pedidos de Fornecedores'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '201': { description: 'Pedido criado com sucesso' }
                }
            }
        },

        // === ESTOQUE ===
        '/stock': {
            get: {
                summary: 'Consultar estoque',
                tags: ['Estoque'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Informações de estoque',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            product_id: { type: 'string' },
                                            quantity: { type: 'integer' },
                                            reserved: { type: 'integer' },
                                            available: { type: 'integer' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        // === AVALIAÇÕES ===
        '/reviews': {
            get: {
                summary: 'Listar avaliações',
                tags: ['Avaliações'],
                parameters: [
                    { name: 'product_id', in: 'query', schema: { type: 'string' } }
                ],
                responses: {
                    '200': {
                        description: 'Lista de avaliações',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Review' }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                summary: 'Criar avaliação',
                tags: ['Avaliações'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '201': { description: 'Avaliação criada com sucesso' }
                }
            }
        },

        // === CUPONS ===
        '/coupon': {
            get: {
                summary: 'Listar cupons',
                tags: ['Cupons'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Lista de cupons',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Coupon' }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                summary: 'Criar cupom',
                tags: ['Cupons'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '201': { description: 'Cupom criado com sucesso' }
                }
            }
        },
        '/coupon/validate/{code}': {
            get: {
                summary: 'Validar cupom',
                tags: ['Cupons'],
                parameters: [
                    { name: 'code', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Cupom válido' },
                    '404': { description: 'Cupom não encontrado ou expirado' }
                }
            }
        },

        // === USUÁRIOS ===
        '/user': {
            get: {
                summary: 'Listar usuários (Admin)',
                tags: ['Usuários'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Lista de usuários',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/User' }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/user/{id}': {
            get: {
                summary: 'Obter usuário por ID',
                tags: ['Usuários'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Detalhes do usuário' },
                    '404': { description: 'Usuário não encontrado' }
                }
            },
            put: {
                summary: 'Atualizar usuário',
                tags: ['Usuários'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Usuário atualizado com sucesso' }
                }
            },
            delete: {
                summary: 'Excluir usuário',
                tags: ['Usuários'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Usuário excluído com sucesso' }
                }
            }
        },

        // === ADMINISTRAÇÃO ===
        '/admin': {
            get: {
                summary: 'Painel administrativo',
                tags: ['Administração'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Acesso ao painel administrativo' }
                }
            }
        },
        '/admin/stats': {
            get: {
                summary: 'Estatísticas administrativas',
                tags: ['Administração'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Estatísticas do sistema' }
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
        '/variants': {
            get: {
                summary: 'Listar variantes de produtos',
                tags: ['Variantes de Produtos'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'productId', in: 'query', schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Lista de variantes' }
                }
            },
            post: {
                summary: 'Criar variante',
                tags: ['Variantes de Produtos'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['productId', 'name', 'price'],
                                properties: {
                                    productId: { type: 'string' },
                                    name: { type: 'string' },
                                    price: { type: 'number' },
                                    sku: { type: 'string' },
                                    stock: { type: 'integer' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Variante criada com sucesso' }
                }
            }
        },
        '/variants/{id}': {
            get: {
                summary: 'Obter variante por ID',
                tags: ['Variantes de Produtos'],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Detalhes da variante' }
                }
            },
            put: {
                summary: 'Atualizar variante',
                tags: ['Variantes de Produtos'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Variante atualizada com sucesso' }
                }
            },
            delete: {
                summary: 'Excluir variante',
                tags: ['Variantes de Produtos'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Variante excluída com sucesso' }
                }
            }
        },

        // === IMAGENS DE PRODUTOS ===
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
        '/product-images/product/{productId}': {
            get: {
                summary: 'Listar imagens de um produto',
                tags: ['Imagens de Produtos'],
                parameters: [
                    {
                        name: 'productId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                        description: 'ID do produto'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Lista de imagens do produto',
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
                                                    createdAt: { type: 'string', format: 'date-time' }
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
            delete: {
                summary: 'Excluir imagem',
                tags: ['Imagens de Produtos'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Imagem excluída com sucesso' }
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
                    '200': { description: 'Detalhes da coleção' }
                }
            },
            put: {
                summary: 'Atualizar coleção',
                tags: ['Coleções'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Coleção atualizada com sucesso' }
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
                    '200': { description: 'Coleção excluída com sucesso' }
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
                    '200': { description: 'Detalhes do fornecedor' }
                }
            },
            put: {
                summary: 'Atualizar fornecedor',
                tags: ['Fornecedores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Fornecedor atualizado com sucesso' }
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
                    '200': { description: 'Fornecedor excluído com sucesso' }
                }
            }
        },

        // === PEDIDOS DE FORNECEDORES EXPANDIDO ===
        '/supplier-orders/{id}': {
            get: {
                summary: 'Obter pedido de fornecedor por ID',
                tags: ['Pedidos de Fornecedores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Detalhes do pedido de fornecedor' }
                }
            },
            put: {
                summary: 'Atualizar pedido de fornecedor',
                tags: ['Pedidos de Fornecedores'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Pedido atualizado com sucesso' }
                }
            }
        },

        // === ESTOQUE EXPANDIDO ===
        '/stock/product/{productId}': {
            get: {
                summary: 'Consultar estoque de produto específico',
                tags: ['Estoque'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'productId', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Informações de estoque do produto' }
                }
            }
        },
        '/stock/update': {
            post: {
                summary: 'Atualizar estoque',
                tags: ['Estoque'],
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
                                    quantity: { type: 'integer' },
                                    operation: { type: 'string', enum: ['add', 'subtract', 'set'] }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Estoque atualizado com sucesso' }
                }
            }
        },

        // === AVALIAÇÕES EXPANDIDO ===
        '/reviews/{id}': {
            get: {
                summary: 'Obter avaliação por ID',
                tags: ['Avaliações'],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Detalhes da avaliação' }
                }
            },
            put: {
                summary: 'Atualizar avaliação',
                tags: ['Avaliações'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Avaliação atualizada com sucesso' }
                }
            },
            delete: {
                summary: 'Excluir avaliação',
                tags: ['Avaliações'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Avaliação excluída com sucesso' }
                }
            }
        },

        // === CUPONS EXPANDIDO ===
        '/coupon/{id}': {
            get: {
                summary: 'Obter cupom por ID',
                tags: ['Cupons'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Detalhes do cupom' }
                }
            },
            put: {
                summary: 'Atualizar cupom',
                tags: ['Cupons'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Cupom atualizado com sucesso' }
                }
            },
            delete: {
                summary: 'Excluir cupom',
                tags: ['Cupons'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': { description: 'Cupom excluído com sucesso' }
                }
            }
        },

        // === WISHLIST ===
        '/wishlist': {
            get: {
                summary: 'Obter lista de desejos',
                tags: ['Lista de Desejos'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Lista de desejos do usuário' }
                }
            },
            post: {
                summary: 'Adicionar à lista de desejos',
                tags: ['Lista de Desejos'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Item adicionado à lista de desejos' }
                }
            }
        },

        // === UPLOAD ===
        '/upload': {
            post: {
                summary: 'Upload de arquivo',
                tags: ['Upload'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    file: {
                                        type: 'string',
                                        format: 'binary'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Arquivo enviado com sucesso' }
                }
            }
        },
        '/upload/proof': {
            post: {
                summary: 'Upload de comprovativo de pagamento/licença (imagem/PDF)',
                tags: ['Upload'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    file: {
                                        type: 'string',
                                        format: 'binary'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Comprovativo enviado com sucesso!' },
                    '400': { description: 'Nenhum ficheiro enviado ou formato inválido' },
                    '401': { description: 'Não autenticado (token JWT obrigatório)' }
                }
            }
        },

        // === MOEDAS ===
        '/currency': {
            get: {
                summary: 'Listar moedas',
                tags: ['Moedas'],
                responses: {
                    '200': { description: 'Lista de moedas suportadas' }
                }
            }
        },
        '/currency/convert': {
            get: {
                summary: 'Converter preço entre moedas (EUR/USD/BRL)',
                tags: ['Currency'],
                parameters: [
                    {
                        name: 'amount',
                        in: 'query',
                        required: true,
                        schema: { type: 'number' },
                        description: 'Valor a converter'
                    },
                    {
                        name: 'from',
                        in: 'query',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Moeda de origem (EUR, USD, BRL)'
                    },
                    {
                        name: 'to',
                        in: 'query',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Moeda de destino (EUR, USD, BRL)'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Valor convertido e taxa de câmbio',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        converted: { type: 'number', example: 10.75 },
                                        rate: { type: 'number', example: 1.075 },
                                        from: { type: 'string', example: 'EUR' },
                                        to: { type: 'string', example: 'USD' }
                                    }
                                }
                            }
                        }
                    },
                    '400': { description: 'Parâmetros em falta ou inválidos' }
                }
            }
        },

        // === PERMISSÕES ===
        '/api/permissions': {
            get: {
                summary: 'Listar permissões',
                tags: ['Permissões'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Lista de permissões' }
                }
            }
        },

        // === GUIAS DE TAMANHO ===
        '/size-guides': {
            get: {
                summary: 'Listar guias de tamanho',
                tags: ['Guias de Tamanho'],
                responses: {
                    '200': { description: 'Lista de guias de tamanho' }
                }
            },
            post: {
                summary: 'Criar guia de tamanho',
                tags: ['Guias de Tamanho'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '201': { description: 'Guia criado com sucesso' }
                }
            }
        },

        // === FILTROS ===
        '/filter': {
            get: {
                summary: 'Obter filtros disponíveis',
                tags: ['Filtros'],
                responses: {
                    '200': { description: 'Filtros disponíveis para produtos' }
                }
            }
        },

        // === FATURAS ===
        '/invoice': {
            get: {
                summary: 'Listar faturas',
                tags: ['Faturas'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Lista de faturas' }
                }
            },
            post: {
                summary: 'Gerar fatura',
                tags: ['Faturas'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '201': { description: 'Fatura gerada com sucesso' }
                }
            }
        },

        // === LICENÇAS ===
        '/license': {
            get: {
                summary: 'Listar licenças',
                tags: ['Licenças'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Lista de licenças' }
                }
            }
        },

        // === AUDITORIA ===
        '/admin/audit-logs': {
            get: {
                summary: 'Logs de auditoria',
                tags: ['Auditoria'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Logs de auditoria do sistema' }
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

        // === WISHLIST MISSING ENDPOINTS ===
        '/wishlist/{productId}': {
            delete: {
                summary: 'Remover produto da lista de desejos',
                tags: ['Wishlist'],
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
                    '401': { description: 'Não autenticado' },
                    '404': { description: 'Produto não encontrado na lista de desejos' }
                }
            }
        },
        '/wishlist/move-to-cart': {
            post: {
                summary: 'Mover item da lista de desejos para o carrinho',
                tags: ['Wishlist'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['productId'],
                                properties: {
                                    productId: { type: 'string', example: 'clx123' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Item movido para o carrinho com sucesso' },
                    '401': { description: 'Não autenticado' },
                    '404': { description: 'Produto não encontrado na lista de desejos' }
                }
            }
        },

        // === USER ENDPOINTS (MISSING) ===
        '/user/export': {
            get: {
                summary: 'Exportar todos os dados do utilizador autenticado (GDPR)',
                tags: ['User'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Dados exportados em JSON',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    example: {
                                        id: 'clx123',
                                        email: 'user@email.com',
                                        name: 'Utilizador Exemplo',
                                        licenses: [],
                                        orders: [],
                                        auditLogs: [],
                                        reviews: [],
                                        wishlist: []
                                    }
                                }
                            }
                        }
                    },
                    '401': { description: 'Não autenticado (token JWT obrigatório)' }
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