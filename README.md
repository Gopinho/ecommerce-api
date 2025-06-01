
# 🛒 E-Commerce API - Node.js, TypeScript & Prisma

API completa para uma loja online, com autenticação JWT, 2FA, Stripe, gestão de produtos, carrinho, wishlist, reviews, cupons, licenças, faturas em PDF, logs de auditoria e muito mais.

---

## 📁 Estrutura do Projeto

```
.
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── tsconfig.json
└── src/
    ├── index.ts
    ├── controllers/
    ├── generated/
    │   └── prisma/
    ├── lib/
    ├── middlewares/
    ├── prisma/
    ├── routes/
    ├── services/
    ├── types/
    └── utils/
```

- **controllers/**: Lógica dos endpoints (ex: autenticação, produtos, carrinho, etc)
- **middlewares/**: Middlewares de autenticação, autorização, rate limiting, etc
- **services/**: Lógica de negócio e integração com o banco de dados
- **routes/**: Definição das rotas Express
- **prisma/**: Schema e migrações do Prisma ORM
- **lib/**: Integrações externas (ex: Stripe, mailer)
- **utils/**: Funções utilitárias (ex: JWT, email)
- **types/**: Tipos TypeScript globais e extensões

---

## 🚀 Funcionalidades Principais

### 1. Autenticação & Segurança

- Registro e login com JWT + Refresh Token
- 2FA (autenticação de dois fatores) com TOTP
- Logout e revogação de tokens
- Rate limiting por IP (express-rate-limit)
- Recuperação e redefinição de senha por email
- Middleware de autenticação e autorização por role (admin/cliente)
- Proteção de rotas sensíveis (admin, alteração de senha, etc.)
- Monitoramento de sessões ativas
- Auditoria de login por dispositivo (user-agent e IP)
- Logs de atividade do utilizador (audit logs)

### 2. Gestão de Utilizadores

- Perfis de utilizador (admin, cliente)
- Wishlist (adicionar/remover/mover para carrinho)
- Reviews de produtos (criar, atualizar, apagar, média)
- Licenças de software (geração, validação, renovação, revogação, download de software)

### 3. Produtos & Categorias

- CRUD de produtos (admin)
- CRUD de categorias (admin)
- Paginação e filtros em listagens
- Cache de produtos populares (sugestão: Redis)
- Sistema de notificações (ex: email para admins)

### 4. Carrinho & Checkout

- Adicionar/remover/atualizar itens no carrinho
- Checkout com Stripe (pagamento seguro)
- Aplicação de cupons de desconto (percentual/fixo, limite de uso, valor mínimo, validade)
- Webhook Stripe para confirmação de pagamento e criação de encomenda
- Geração de fatura em PDF (pdfkit)
- Simulação de sistema de devoluções/reembolsos

### 5. Encomendas & Logística

- CRUD de encomendas (admin)
- Estados da encomenda: Pendente → Pago → Enviado → Entregue → Concluído
- Simulação de transportadora
- Upload de comprovativo (imagem/PDF) para admins/clientes

### 6. Extras & DevOps

- Testes unitários (Jest) e integração (Supertest)
- Documentação automática (Swagger/OpenAPI)
- Docker para desenvolvimento e produção
- CI/CD com GitHub Actions
- Variáveis de ambiente (.env) e validação
- Internacionalização (pt, en)
- Multi-moeda (conversão EUR/USD/BRL via API)
- Multi-tenant (múltiplas lojas)
- RBAC avançado (gestão de permissões por grupo)
- Integração com Telegram/WhatsApp para admins (avisos de vendas)
- Webhooks (Stripe e outros sistemas)

---

## 📚 Endpoints Principais

| Método | Endpoint                                 | Descrição                                      | Proteção           |
|--------|------------------------------------------|------------------------------------------------|--------------------|
| POST   | /auth/register                           | Registo de utilizador                          | -                  |
| POST   | /auth/login                              | Login                                          | -                  |
| POST   | /auth/refresh                            | Refresh token                                  | -                  |
| POST   | /auth/logout                             | Logout                                         | JWT                |
| POST   | /auth/request-password-reset             | Solicitar reset de senha                       | -                  |
| POST   | /auth/reset-password                     | Redefinir senha                                | -                  |
| POST   | /auth/2fa/setup                          | Configurar 2FA                                 | JWT                |
| POST   | /auth/2fa/verify                         | Ativar 2FA                                     | JWT                |
| POST   | /auth/2fa/disable                        | Desativar 2FA                                  | JWT                |
| GET    | /auth/me                                 | Perfil do utilizador autenticado               | JWT                |
| POST   | /auth/change-email                       | Alterar email do utilizador                    | JWT                |
| GET    | /api/products                            | Listar produtos                                | -                  |
| GET    | /api/products/popular                    | Listar produtos populares                      | -                  |
| POST   | /api/products                            | Criar produto                                  | JWT + ADMIN        |
| PUT    | /api/products/:id                        | Atualizar produto                              | JWT + ADMIN        |
| DELETE | /api/products/:id                        | Apagar produto                                 | JWT + ADMIN        |
| GET    | /api/categories                          | Listar categorias                              | -                  |
| POST   | /api/categories                          | Criar categoria                                | JWT + ADMIN        |
| PUT    | /api/categories/:id                      | Atualizar categoria                            | JWT + ADMIN        |
| DELETE | /api/categories/:id                      | Apagar categoria                               | JWT + ADMIN        |
| GET    | /cart                                    | Ver carrinho                                   | JWT                |
| POST   | /cart                                    | Adicionar ao carrinho                          | JWT                |
| PUT    | /cart/:id                                | Atualizar item do carrinho                     | JWT                |
| DELETE | /cart/:id                                | Remover item do carrinho                       | JWT                |
| POST   | /checkout/stripe                         | Criar sessão de checkout Stripe                | JWT                |
| GET    | /wishlist                                | Ver wishlist                                   | JWT                |
| POST   | /wishlist                                | Adicionar à wishlist                           | JWT                |
| DELETE | /wishlist/:productId                     | Remover da wishlist                            | JWT                |
| POST   | /wishlist/move-to-cart                   | Mover da wishlist para o carrinho              | JWT                |
| GET    | /review/:productId                       | Reviews de produto                             | -                  |
| GET    | /review/:productId/average               | Média das avaliações do produto                | -                  |
| POST   | /review/:productId                       | Criar/atualizar review                         | JWT                |
| DELETE | /review/:productId                       | Apagar review                                  | JWT                |
| GET    | /review/user/:userId                     | Reviews de um utilizador (admin)               | JWT + ADMIN        |
| GET    | /invoice/:id                             | Download de fatura PDF                         | JWT                |
| GET    | /invoice/download-all                    | Download de todas as faturas/licenças          | JWT                |
| GET    | /license                                 | Listar licenças do utilizador                  | JWT                |
| POST   | /license/renew                           | Renovar licença                                | JWT                |
| POST   | /license/revoke                          | Revogar licença                                | JWT + ADMIN        |
| GET    | /license/download                        | Download do software (por licença)             | JWT                |
| POST   | /coupon                                  | Criar cupão                                    | JWT + ADMIN        |
| GET    | /coupon/:code                            | Obter cupão pelo código                        | JWT                |
| GET    | /admin                                   | Área administrativa                            | JWT + ADMIN        |
| GET    | /admin/stats                             | Estatísticas administrativas                   | JWT + ADMIN        |
| GET    | /admin/audit-logs                        | Logs de auditoria                              | JWT + ADMIN        |
| GET    | /admin/audit-logs/user/:userId           | Logs de auditoria de um utilizador (admin)     | JWT + ADMIN        |
| GET    | /admin/users                             | Listar utilizadores (admin)                    | JWT + ADMIN        |
| POST   | /upload                                  | Upload de comprovativo                         | JWT                |
| GET    | /user/export                             | Exportar dados do utilizador (GDPR)            | JWT                |
| GET    | /currency/convert                        | Converter moeda (EUR/USD/BRL)                  | -                  |
| POST   | /webhook/stripe                          | Webhook Stripe                                 | -                  |

---

## 🛡️ Segurança

- **Autenticação JWT**: Tokens de acesso e refresh para sessões seguras.
- **2FA (Autenticação de Dois Fatores)**: Opcional para utilizadores/admins.
- **Rate Limiting**: Limita tentativas de login para evitar brute force.
- **Hash de Senhas**: Senhas armazenadas com bcrypt.
- **Validação de Dados**: (Sugestão: usar Zod/Yup para validação robusta de inputs).
- **Proteção de Rotas**: Middlewares para autenticação e autorização por role.
- **Revogação de Tokens**: Refresh tokens podem ser revogados a qualquer momento.
- **Proteção de Webhooks**: Verificação de assinatura nos webhooks Stripe.
- **Variáveis de Ambiente**: Segredos e chaves nunca no código fonte.
- **Logs de Auditoria**: Todas as ações sensíveis são auditadas.
- **Recuperação de Senha**: Reset seguro via email com tokens temporários.
- **Uploads Seguros**: (Sugestão: validar tipo e tamanho de ficheiros enviados).
- **CORS**: (Sugestão: configurar CORS restritivo para produção).
- **Headers de Segurança**: (Sugestão: usar helmet para adicionar headers HTTP seguros).
- **Atualizações de Dependências**: (Sugestão: manter dependências sempre atualizadas para evitar vulnerabilidades conhecidas).

---

## 🛠️ Comandos Úteis

| Comando                                                          | Descrição                                 |
|------------------------------------------------------------------|-------------------------------------------|
| `npx ts-node-dev src/index.ts`                                   | Iniciar o projeto em modo dev             |
| `npx prisma migrate dev --name add_nome_migracao` (na pasta src) | Migrar a base de dados                    |
| `stripe listen --forward-to localhost:3000/api/webhook`          | Criar listener para o webhook do Stripe   |

---

## 📦 Instalação

```sh
git clone <repo>
cd <repo>
npm install
cp .env.example .env

npx prisma migrate deploy   # dentro da pasta src/
npx prisma generate         # dentro da pasta src/
npm run dev
```

---

## ✅ Checklist de Funcionalidades/Endpoints a Implementar ou Melhorar

- [x] Documentação Swagger/OpenAPI dos endpoints
- [x] Testes unitários e de integração (Jest/Supertest) para controllers e services principais
- [x] Endpoint `/auth/me` para perfil do utilizador autenticado
- [x] Endpoint para alterar email do utilizador
- [x] Endpoint para upload de comprovativo de pagamento/licença (imagem/PDF)
- [x] Endpoint para logs de auditoria detalhados por utilizador
- [x] Endpoint para exportação de dados do utilizador (GDPR)
- [x] Implementar cache de produtos de software populares (ex: Redis)
- [x] Internacionalização de mensagens de erro e sucesso (pt/en)
- [x] Multi-moeda: endpoint para conversão de preços (EUR/USD/BRL)
- [x] RBAC avançado: gestão de permissões por grupo
- [x] Integração com Telegram/WhatsApp para avisos de admins
- [x] Melhorar tratamento de erros globais (middleware)
- [x] Endpoint para estatísticas de vendas/admin dashboard
- [x] Melhorar validação de dados (ex: Zod/Yup)
- [ ] Dockerfile e docker-compose para ambiente de produção
- [ ] CI/CD (GitHub Actions) para testes e deploy automático
- [ ] Scripts de seed para base de dados de desenvolvimento
- [x] Endpoint para reviews por utilizador (não só por produto)
- [x] Endpoint para download de todas as faturas/licenças do utilizador
- [x] Endpoint para simulação de renovação automática de licença

---

## 🔐 Como proteger ações sensíveis com 2FA

### Adicionar 2FA numa ação específica

Para exigir autenticação de dois fatores (2FA) numa rota sensível (ex: alteração de password), basta adicionar o middleware `require2FA`:

```typescript
import { authenticate } from '../middlewares/authenticate';
import { require2FA } from '../middlewares/require2fa.middleware';
import { changePassword } from '../controllers/user.controller';

router.post('/user/change-password', authenticate, require2FA, changePassword);
```

---

## 🗂️ Avisar Admins - Telegram
```typescript
import { sendTelegramMessage } from './telegram.service';

...

export async function notifyNewOrder(orderId: string, userEmail: string) {
  await sendTelegramMessage(`Nova venda! Pedido #${orderId} do utilizador ${userEmail}`);
}
```

---

## 🛡️ Exemplos de gestão de permissões (Prisma)

## Criar uma permissão

```typescript
await prisma.permission.create({
  data: { name: 'product:create' }
});
```

### Associar uma permissão a um utilizador

```typescript
await prisma.user.update({
  where: { id: 'USER_ID' },
  data: {
    permissions: { connect: { name: 'product:create' } }
  }
});
```

### Criar um grupo

```typescript
await prisma.userGroup.create({
  data: { name: 'admin' }
});
```

### Associar um grupo a um utilizador

```typescript
await prisma.user.update({
  where: { id: 'USER_ID' },
  data: { groupId: 'GROUP_ID' }
});
```

---

## Exemplo de validação de dados com Zod

```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const result = userSchema.safeParse({ email: 'email@email.com', password: 'password' });
if (!result.success) {
  
  console.log(result.error.errors);
}