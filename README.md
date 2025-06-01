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
├── jest.config.js
└── src/
    ├── index.ts
    ├── controllers/
    ├── generated/
    │   └── prisma/
    ├── lib/
    ├── middlewares/
    ├── prisma/
    ├── routes/
    ├── locales/
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
- Documentação Swagger/OpenAPI dos endpoints
- Tratamento global de erros (middleware)
- Internacionalização de mensagens de erro e sucesso (pt/en)
- RBAC avançado: gestão de permissões por grupo
- Endpoint para logs de auditoria detalhados por utilizador
- Endpoint para exportação de dados do utilizador (GDPR)
- Proteção de ações sensíveis com 2FA

### 2. Gestão de Utilizadores

- Perfis de utilizador (admin, cliente)
- Wishlist (adicionar/remover/mover para carrinho)
- Reviews de produtos (criar, atualizar, apagar, média)
- Licenças de software (geração, validação, renovação, revogação, download de software)
- Endpoint `/auth/me` para perfil do utilizador autenticado
- Endpoint para alterar email do utilizador
- Endpoint para reviews por utilizador (não só por produto)
- Endpoint para simulação de renovação automática de licença

### 3. Produtos & Categorias

- CRUD de produtos (admin)
- CRUD de categorias (admin)
- Paginação e filtros em listagens
- Cache de produtos populares (Redis)
- Sistema de notificações (ex: email/Telegram para admins)
- Testes unitários e de integração (Jest/Supertest) para controllers e services principais

### 4. Carrinho & Checkout

- Adicionar/remover/atualizar itens no carrinho
- Checkout com Stripe (pagamento seguro)
- Aplicação de cupons de desconto (percentual/fixo, limite de uso, valor mínimo, validade)
- Webhook Stripe para confirmação de pagamento e criação de encomenda
- Geração de fatura em PDF (pdfkit)
- Endpoint para download de todas as faturas/licenças do utilizador

### 5. Encomendas & Logística

- CRUD de encomendas (admin)
- Estados da encomenda: Pendente → Pago → Enviado → Entregue → Concluído
- Simulação de transportadora
- Upload de comprovativo (imagem/PDF) para admins/clientes
- Endpoint para upload de comprovativo de pagamento/licença (imagem/PDF)
- Endpoint para estatísticas de vendas/admin dashboard

### 6. Extras & DevOps

- Testes unitários (Jest) e integração (Supertest)
- Documentação automática (Swagger/OpenAPI)
- Docker para desenvolvimento e produção
- CI/CD com GitHub Actions
- Variáveis de ambiente (.env) e validação
- Internacionalização (pt, en)
- Multi-moeda (conversão EUR/USD/BRL via API)
- RBAC avançado (gestão de permissões por grupo)
- Integração com Telegram/WhatsApp para admins (avisos de vendas)
- Webhooks (Stripe e outros sistemas)
- Endpoint `/metrics` para Prometheus (monitoramento de performance)
- Sentry para monitoramento de erros e tracing
- Monitoramento de uptime e alertas para admins

---

## 📚 Endpoints Principais

| Método | Endpoint                                 | Descrição                                      | Proteção           | Exemplo (curl)                                                                                                                                                                                                               |
|--------|------------------------------------------|------------------------------------------------|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| POST   | /auth/register                           | Registo de utilizador                          | -                  | `curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"email":"novo@email.com","password":"12345678","name":"Novo User"}'`                                                              |
| POST   | /auth/login                              | Login                                          | -                  | `curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"novo@email.com","password":"12345678"}'`                                                                                    |
| POST   | /auth/refresh                            | Refresh token                                  | -                  | `curl -X POST http://localhost:3000/auth/refresh -H "Content-Type: application/json" -d '{"refreshToken":"<TOKEN>"}'`                                                                                                        |
| POST   | /auth/logout                             | Logout                                         | JWT                | `curl -X POST http://localhost:3000/auth/logout -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"refreshToken":"<TOKEN>"}'`                                                                      |
| POST   | /auth/request-password-reset             | Solicitar reset de senha                       | -                  | `curl -X POST http://localhost:3000/auth/request-password-reset -H "Content-Type: application/json" -d '{"email":"teu@email.com"}'`                                                                                          |
| POST   | /auth/reset-password                     | Redefinir senha                                | -                  | `curl -X POST http://localhost:3000/auth/reset-password -H "Content-Type: application/json" -d '{"token":"<TOKEN>","newPassword":"novaSenha123"}'`                                                                           |
| POST   | /auth/2fa/setup                          | Configurar 2FA                                 | JWT                | `curl -X POST http://localhost:3000/auth/2fa/setup -H "Authorization: Bearer <TOKEN>"`                                                                                                                                       |
| POST   | /auth/2fa/verify                         | Ativar 2FA                                     | JWT                | `curl -X POST http://localhost:3000/auth/2fa/verify -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"token":"123456"}'`                                                                          |
| POST   | /auth/2fa/disable                        | Desativar 2FA                                  | JWT                | `curl -X POST http://localhost:3000/auth/2fa/disable -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"token":"123456"}'`                                                                         |
| GET    | /auth/me                                 | Perfil do utilizador autenticado               | JWT                | `curl http://localhost:3000/auth/me -H "Authorization: Bearer <TOKEN>"`                                                                                                                                                      |
| POST   | /auth/change-email                       | Alterar email do utilizador                    | JWT                | `curl -X POST http://localhost:3000/auth/change-email -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"newEmail":"novo@email.com"}'`                                                             |
| GET    | /products                                | Listar produtos                                | -                  | `curl http://localhost:3000/products`                                                                                                                                                                                        |
| GET    | /products/popular                        | Listar produtos populares                      | -                  | `curl http://localhost:3000/products/popular`                                                                                                                                                                                |
| POST   | /products                                | Criar produto                                  | JWT + ADMIN        | `curl -X POST http://localhost:3000/products -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"name":"Produto","description":"Desc","price":10,"stock":5,"categoryId":"<ID>"}'`                   |
| PUT    | /products/:id                            | Atualizar produto                              | JWT + ADMIN        | `curl -X PUT http://localhost:3000/products/<ID> -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"name":"Novo Nome","description":"Nova Desc","price":12,"stock":10,"categoryId":"<ID>"}'`         |
| DELETE | /products/:id                            | Apagar produto                                 | JWT + ADMIN        | `curl -X DELETE http://localhost:3000/products/<ID> -H "Authorization: Bearer <TOKEN>"`                                                                                                                                      |
| GET    | /categories                              | Listar categorias                              | -                  | `curl http://localhost:3000/categories`                                                                                                                                                                                      |
| POST   | /categories                              | Criar categoria                                | JWT + ADMIN        | `curl -X POST http://localhost:3000/categories -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"name":"Nova Categoria"}'`                                                                        |
| PUT    | /categories/:id                          | Atualizar categoria                            | JWT + ADMIN        | `curl -X PUT http://localhost:3000/categories/<ID> -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"name":"Categoria Atualizada"}'`                                                              |
| DELETE | /categories/:id                          | Apagar categoria                               | JWT + ADMIN        | `curl -X DELETE http://localhost:3000/categories/<ID> -H "Authorization: Bearer <TOKEN>"`                                                                                                                                    |
| GET    | /cart                                    | Ver carrinho                                   | JWT                | `curl http://localhost:3000/cart -H "Authorization: Bearer <TOKEN>"`                                                                                                                                                         |
| POST   | /cart                                    | Adicionar ao carrinho                          | JWT                | `curl -X POST http://localhost:3000/cart -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"productId":"<ID>","quantity":1}'`                                                                      |
| PUT    | /cart/:id                                | Atualizar item do carrinho                     | JWT                | `curl -X PUT http://localhost:3000/cart/<ID> -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"quantity":2}'`                                                                                     |
| DELETE | /cart/:id                                | Remover item do carrinho                       | JWT                | `curl -X DELETE http://localhost:3000/cart/<ID> -H "Authorization: Bearer <TOKEN>"`                                                                                                                                          |
| POST   | /checkout/stripe                         | Criar sessão de checkout Stripe                | JWT                | `curl -X POST http://localhost:3000/checkout/stripe -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"couponCode":"DESCONTO10"}'`                                                                 |
| GET    | /wishlist                                | Ver wishlist                                   | JWT                | `curl http://localhost:3000/wishlist -H "Authorization: Bearer <TOKEN>"`                                                                                                                                                     |
| POST   | /wishlist                                | Adicionar à wishlist                           | JWT                | `curl -X POST http://localhost:3000/wishlist -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"productId":"<ID>"}'`                                                                               |
| DELETE | /wishlist/:productId                     | Remover da wishlist                            | JWT                | `curl -X DELETE http://localhost:3000/wishlist/<ID> -H "Authorization: Bearer <TOKEN>"`                                                                                                                                      |
| POST   | /wishlist/move-to-cart                   | Mover da wishlist para o carrinho              | JWT                | `curl -X POST http://localhost:3000/wishlist/move-to-cart -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"productId":"<ID>"}'`                                                                  |
| GET    | /reviews/:productId                      | Reviews de produto                             | -                  | `curl http://localhost:3000/reviews/<ID>`                                                                                                                                                                                    |
| GET    | /reviews/:productId/average              | Média das avaliações do produto                | -                  | `curl http://localhost:3000/reviews/<ID>/average`                                                                                                                                                                            |
| POST   | /reviews/:productId                      | Criar/atualizar review                         | JWT                | `curl -X POST http://localhost:3000/reviews/<ID> -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"rating":5,"comment":"Excelente!"}'`                                                            |
| DELETE | /reviews/:productId                      | Apagar review                                  | JWT                | `curl -X DELETE http://localhost:3000/reviews/<ID> -H "Authorization: Bearer <TOKEN>"`                                                                                                                                       |
| GET    | /reviews/user/:userId                    | Reviews de um utilizador (admin)               | JWT + ADMIN        | `curl http://localhost:3000/reviews/user/<USER_ID> -H "Authorization: Bearer <TOKEN>"`                                                                                                                                       |
| GET    | /invoices/:id                            | Download de fatura PDF                         | JWT                | `curl -O -J http://localhost:3000/invoices/<ID> -H "Authorization: Bearer <TOKEN>"`                                                                                                                                          |
| GET    | /invoices/download/all                   | Download de todas as faturas/licenças          | JWT                | `curl -O -J http://localhost:3000/invoices/download/all -H "Authorization: Bearer <TOKEN>"`                                                                                                                                  |
| GET    | /license                                 | Listar licenças do utilizador                  | JWT                | `curl http://localhost:3000/license -H "Authorization: Bearer <TOKEN>"`                                                                                                                                                      |
| POST   | /license/renew                           | Renovar licença                                | JWT                | `curl -X POST http://localhost:3000/license/renew -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"licenseKey":"<KEY>"}'`                                                                        |
| POST   | /license/revoke                          | Revogar licença                                | JWT + ADMIN        | `curl -X POST http://localhost:3000/license/revoke -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"licenseKey":"<KEY>"}'`                                                                       |
| GET    | /user/export                             | Exportar dados do utilizador (GDPR)            | JWT                | `curl http://localhost:3000/user/export -H "Authorization: Bearer <TOKEN>" -O`                                                                                                                                               |
| GET    | /currency/convert                        | Converter moeda (EUR/USD/BRL)                  | -                  | `curl "http://localhost:3000/currency/convert?amount=10&from=EUR&to=USD"`                                                                                                                                                    |
| POST   | /webhook/stripe                          | Webhook Stripe                                 | -                  | _Usado pelo Stripe, não chamado manualmente_                                                                                                                                                                                 |

---

## 🛡️ Segurança

- **Autenticação JWT**: Tokens de acesso e refresh para sessões seguras.
- **2FA (Autenticação de Dois Fatores)**: Opcional para utilizadores/admins.
- **Rate Limiting**: Limita tentativas de login para evitar brute force.
- **Hash de Senhas**: Senhas armazenadas com bcrypt.
- **Validação de Dados**: Zod para validação robusta de inputs.
- **Proteção de Rotas**: Middlewares para autenticação e autorização por role.
- **Revogação de Tokens**: Refresh tokens podem ser revogados a qualquer momento.
- **Proteção de Webhooks**: Verificação de assinatura nos webhooks Stripe.
- **Variáveis de Ambiente**: Segredos e chaves nunca no código fonte.
- **Logs de Auditoria**: Todas as ações sensíveis são auditadas.
- **Recuperação de Senha**: Reset seguro via email com tokens temporários.
- **Uploads Seguros**: Validação de tipo e tamanho de ficheiros enviados.
- **CORS**: Configurado para produção.
- **Headers de Segurança**: Helmet para adicionar headers HTTP seguros.
- **Atualizações de Dependências**: Manter dependências sempre atualizadas para evitar vulnerabilidades conhecidas.

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

## 🚧 Checklist de Funcionalidades/Endpoints a Implementar ou Melhorar

...

---

## 📊 Monitoramento e Performance

### Prometheus

- Endpoint `/metrics` disponível para métricas de performance (latência, uso de memória, CPU, etc).
- Basta apontar o Prometheus para `http://teuservidor:3000/metrics`.

### Alertas para Admins

- Notificações automáticas via Telegram para admins em eventos críticos (ex: nova venda, erro 500).
- (Opcional) Integração com WhatsApp ou email para alertas adicionais.

---

## 🛡️ Exemplos de gestão de permissões (Prisma)

### Criar uma permissão

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
```
