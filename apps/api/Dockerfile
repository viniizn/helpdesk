# Estágio 1: builder
# Usamos uma imagem Node completa para compilar o TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

# Copia manifests primeiro — aproveita cache do Docker.
# Se package.json não mudou, não reinstala dependências.
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

RUN npm ci --workspaces

# Copia o código e compila
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN npx prisma generate
RUN npx tsc

# Estágio 2: runner
# Imagem final sem ferramentas de build — menor e mais segura
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/package.json ./package.json

# Roda migration e inicia o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]