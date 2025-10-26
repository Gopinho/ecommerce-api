# Multi-stage build para otimizar imagem final
FROM node:18-alpine AS builder

# Instalar dependências necessárias
RUN apk add --no-cache python3 make g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY src ./src

# Build da aplicação
RUN npm run build

# Imagem final de produção
FROM node:18-alpine AS production

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Instalar dependências do sistema
RUN apk add --no-cache tini curl

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos necessários da etapa de build
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Copiar arquivos adicionais necessários
COPY --chown=nodejs:nodejs src/locales ./src/locales
COPY --chown=nodejs:nodejs src/prisma ./src/prisma

# Criar diretório para uploads
RUN mkdir -p /app/uploads && chown nodejs:nodejs /app/uploads

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Usar tini como init system
ENTRYPOINT ["/sbin/tini", "--"]

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"]