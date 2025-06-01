
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
- Melhorar tratamento de erros globais (middleware)
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
- Cache de produtos populares (sugestão: Redis)
- Sistema de notificações (ex: email para admins)
- Implementar cache de produtos de software populares (ex: Redis)
- Testes unitários e de integração (Jest/Supertest) para controllers e services principais

### 4. Carrinho & Checkout

- Adicionar/remover/atualizar itens no carrinho
- Checkout com Stripe (pagamento seguro)
- Aplicação de cupons de desconto (percentual/fixo, limite de uso, valor mínimo, validade)
- Webhook Stripe para confirmação de pagamento e criação de encomenda
- Geração de fatura em PDF (pdfkit)
- Simulação de sistema de devoluções/reembolsos
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
- Multi-tenant (múltiplas lojas)
- RBAC avançado (gestão de permissões por grupo)
- Integração com Telegram/WhatsApp para admins (avisos de vendas)
- Webhooks (Stripe e outros sistemas)
- Multi-moeda: endpoint para conversão de preços (EUR/USD/BRL)
- Integração com Telegram/WhatsApp para avisos de admins
- Melhorar validação de dados (ex: Zod/Yup)

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
| GET    | /api/products                            | Listar produtos                                | -                  | `curl http://localhost:3000/api/products`                                                                                                                                                                                    |
| GET    | /api/products/popular                    | Listar produtos populares                      | -                  | `curl http://localhost:3000/api/products/popular`                                                                                                                                                                            |
| POST   | /api/products                            | Criar produto                                  | JWT + ADMIN        | `curl -X POST http://localhost:3000/api/products -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"name":"Produto","description":"Desc","price":10,"stock":5,"categoryId":"<ID>"}'`               |
| PUT    | /api/products/:id                        | Atualizar produto                              | JWT + ADMIN        | `curl -X PUT http://localhost:3000/api/products/<ID> -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"name":"Novo Nome","description":"Nova Desc","price":12,"stock":10,"categoryId":"<ID>"}'`   |
| DELETE | /api/products/:id                        | Apagar produto                                 | JWT + ADMIN        | `curl -X DELETE http://localhost:3000/api/products/<ID> -H "Authorization: Bearer <TOKEN>"`                                                                                                                                  |
| GET    | /api/categories                          | Listar categorias                              | -                  | `curl http://localhost:3000/api/categories`                                                                                                                                                                                  |
| POST   | /api/categories                          | Criar categoria                                | JWT + ADMIN        | `curl -X POST http://localhost:3000/api/categories -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"name":"Nova Categoria"}'`                                                                    |
| PUT    | /api/categories/:id                      | Atualizar categoria                            | JWT + ADMIN        | `curl -X PUT http://localhost:3000/api/categories/<ID> -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"name":"Categoria Atualizada"}'`                                                          |
| DELETE | /api/categories/:id                      | Apagar categoria                               | JWT + ADMIN        | `curl -X DELETE http://localhost:3000/api/categories/<ID> -H "Authorization: Bearer <TOKEN>"`                                                                                                                                |
| GET    | /cart                                    | Ver carrinho                                   | JWT                | `curl http://localhost:3000/cart -H "Authorization: Bearer <TOKEN>"`                                                                                                                                                         |
| POST   | /cart                                    | Adicionar ao carrinho                          | JWT                | `curl -X POST http://localhost:3000/cart -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"productId":"<ID>","quantity":1}'`                                                                      |
| PUT    | /cart/:id                                | Atualizar item do carrinho                     | JWT                | `curl -X PUT http://localhost:3000/cart/<ID> -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"quantity":2}'`                                                                                     |
| DELETE | /cart/:id                                | Remover item do carrinho                       | JWT                | `curl -X DELETE http://localhost:3000/cart/<ID> -H "Authorization: Bearer <TOKEN>"`                                                                                                                                          |
| POST   | /checkout/stripe                         | Criar sessão de checkout Stripe                | JWT                | `curl -X POST http://localhost:3000/checkout/stripe -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"couponCode":"DESCONTO10"}'`                                                                 |
| GET    | /wishlist                                | Ver wishlist                                   | JWT                | `curl http://localhost:3000/wishlist -H "Authorization: Bearer <TOKEN>"`                                                                                                                                                     |
| POST   | /wishlist                                | Adicionar à wishlist                           | JWT                | `curl -X POST http://localhost:3000/wishlist -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"productId":"<ID>"}'`                                                                               |
| DELETE | /wishlist/:productId                     | Remover da wishlist                            | JWT                | `curl -X DELETE http://localhost:3000/wishlist/<ID> -H "Authorization: Bearer <TOKEN>"`                                                                                                                                      |
| POST   | /wishlist/move-to-cart                   | Mover da wishlist para o carrinho              | JWT                | `curl -X POST http://localhost:3000/wishlist/move-to-cart -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"productId":"<ID>"}'`                                                                  |
| GET    | /review/:productId                       | Reviews de produto                             | -                  | `curl http://localhost:3000/review/<ID>`                                                                                                                                                                                     |
| GET    | /review/:productId/average               | Média das avaliações do produto                | -                  | `curl http://localhost:3000/review/<ID>/average`                                                                                                                                                                             |
| POST   | /review/:productId                       | Criar/atualizar review                         | JWT                | `curl -X POST http://localhost:3000/review/<ID> -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"rating":5,"comment":"Excelente!"}'`                                                             |
| DELETE | /review/:productId                       | Apagar review                                  | JWT                | `curl -X DELETE http://localhost:3000/review/<ID> -H "Authorization: Bearer <TOKEN>"`                                                                                                                                        |
| GET    | /review/user/:userId                     | Reviews de um utilizador (admin)               | JWT + ADMIN        | `curl http://localhost:3000/review/user/<USER_ID> -H "Authorization: Bearer <TOKEN>"`                                                                                                                                        |
| GET    | /invoice/:id                             | Download de fatura PDF                         | JWT                | `curl -O -J http://localhost:3000/invoice/<ID> -H "Authorization: Bearer <TOKEN>"`                                                                                                                                           |
| GET    | /invoice/download-all                    | Download de todas as faturas/licenças          | JWT                | `curl -O -J http://localhost:3000/invoice/download-all -H "Authorization: Bearer <TOKEN>"`                                                                                                                                   |
| GET    | /license                                 | Listar licenças do utilizador                  | JWT                | `curl http://localhost:3000/license -H "Authorization: Bearer <TOKEN>"`                                                                                                                                                      |
| POST   | /license/renew                           | Renovar licença                                | JWT                | `curl -X POST http://localhost:3000/license/renew -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"licenseKey":"<KEY>"}'`                                                                        |
| POST   | /license/revoke                          | Revogar licença                                | JWT + ADMIN        | `curl -X POST http://localhost:3000/license/revoke -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"licenseKey":"<KEY>"}'`                                                                       |
| GET    | /license/download                        | Download do software (por licença)             | JWT                | `curl "http://localhost:3000/license/download?productId=<ID>&licenseKey=<KEY>" -H "Authorization: Bearer <TOKEN>" -O`                                                                                                        |
| POST   | /coupon                                  | Criar cupão                                    | JWT + ADMIN        | `curl -X POST http://localhost:3000/coupon -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"code":"DESCONTO10","amount":10,"discountType":"percent"}'`                                           |
| GET    | /coupon/:code                            | Obter cupão pelo código                        | JWT                | `curl http://localhost:3000/coupon/<CODE> -H "Authorization: Bearer <TOKEN>"`                                                                                                                                                |
| GET    | /admin                                   | Área administrativa                            | JWT + ADMIN        | `curl http://localhost:3000/admin -H "Authorization: Bearer <TOKEN>"`                                                                                                                                                        |
| GET    | /admin/stats                             | Estatísticas administrativas                   | JWT + ADMIN        | `curl http://localhost:3000/admin/stats -H "Authorization: Bearer <TOKEN>"`                                                                                                                                                  |
| GET    | /admin/audit-logs                        | Logs de auditoria                              | JWT + ADMIN        | `curl http://localhost:3000/admin/audit-logs -H "Authorization: Bearer <TOKEN>"`                                                                                                                                             |
| GET    | /admin/audit-logs/user/:userId           | Logs de auditoria de um utilizador (admin)     | JWT + ADMIN        | `curl http://localhost:3000/admin/audit-logs/user/<USER_ID> -H "Authorization: Bearer <TOKEN>"`                                                                                                                              |
| GET    | /admin/users                             | Listar utilizadores (admin)                    | JWT + ADMIN        | `curl http://localhost:3000/admin/users -H "Authorization: Bearer <TOKEN>"`                                                                                                                                                  |
| POST   | /upload                                  | Upload de comprovativo                         | JWT                | `curl -X POST http://localhost:3000/upload -H "Authorization: Bearer <TOKEN>" -F "file=@/caminho/ficheiro.pdf"`                                                                                                              |
| GET    | /user/export                             | Exportar dados do utilizador (GDPR)            | JWT                | `curl http://localhost:3000/user/export -H "Authorization: Bearer <TOKEN>" -O`                                                                                                                                               |
| GET    | /currency/convert                        | Converter moeda (EUR/USD/BRL)                  | -                  | `curl "http://localhost:3000/currency/convert?amount=10&from=EUR&to=USD"`                                                                                                                                                    |
| POST   | /webhook/stripe                          | Webhook Stripe                                 | -                  | _Usado pelo Stripe, não chamado manualmente_                                                                                                                                                                                 |

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

- [ ] Implementar paginação e filtros avançados nas listagens de produtos e categorias
- [x] Adicionar cache (ex: Redis) para produtos populares e endpoints de leitura intensiva
- [x] Implementar upload seguro (validação de tipo/tamanho de ficheiros)
- [x] Adicionar CORS restritivo para produção
- [x] Adicionar headers de segurança (helmet)
- [x] Validar dados de entrada com Zod/Yup em todos os endpoints
- [x] Melhorar documentação Swagger/OpenAPI (exemplos de request/response, schemas detalhados)
- [x] Implementar sistema de notificações para admins (Telegram/WhatsApp) em eventos críticos (ex: nova venda, erro 500)
- [ ] Implementar multi-tenant (suporte a múltiplas lojas)
- [ ] Adicionar endpoint para simulação de devoluções/reembolsos
- [ ] Implementar exportação de dados do utilizador (GDPR) em formatos alternativos (ex: CSV)
- [ ] Adicionar logs de auditoria mais detalhados (ex: alterações de permissões, ações administrativas)
- [ ] Melhorar RBAC: gestão de permissões dinâmicas por grupo e utilizador
- [ ] Adicionar endpoint para estatísticas de vendas/admin dashboard
- [ ] Implementar sistema de notificações por email para eventos importantes (ex: renovação de licença, expiração)
- [ ] Adicionar suporte a multi-moeda em mais endpoints (ex: preços dinâmicos por moeda)
- [ ] Implementar integração com outros métodos de pagamento além do Stripe
- [x] Melhorar internacionalização: garantir todas as mensagens traduzidas (pt/en)
- [ ] Adicionar testes de performance para endpoints críticos
- [ ] Automatizar deploy com CI/CD (ex: GitHub Actions)
- [x] Adicionar exemplos de uso da API no README (curl, httpie, etc)
- [ ] Revisar e otimizar queries Prisma para performance
- [ ] Garantir que todas as rotas sensíveis exigem 2FA quando configurado
- [ ] Adicionar endpoint para gestão de permissões e grupos via API (admin)
- [ ] Implementar sistema de rate limiting customizado por endpoint
- [ ] Adicionar monitoramento de uptime e alertas para admins

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

await sendTelegramMessage(`string`);

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