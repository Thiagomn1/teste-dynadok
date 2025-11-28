# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências
RUN npm ci && \
    npm cache clean --force

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar arquivos buildados do estágio anterior
COPY --from=builder /app/dist ./dist

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Mudar para usuário não-root
USER nodejs

# Expor porta da aplicação
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"]
