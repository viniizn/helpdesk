# Helpdesk — Sistema de Chamados

Sistema de suporte técnico híbrido (presencial e remoto) desenvolvido com foco em organização de fila de atendimento, rastreabilidade e controle de acesso por perfil.

## Funcionalidades

**Autenticação e Acesso**
- Login seguro com cookies HttpOnly — token nunca exposto no frontend
- Acesso restrito por convite — o admin convida usuários via email, sem cadastro público
- Controle de perfis: Usuário, Técnico e Administrador

**Chamados**
- Abertura de chamados com título, descrição, prioridade, categoria e localização
- Fluxo de status validado: `Aberto → Em atendimento → Aguardando → Resolvido → Encerrado`
- Auto-atribuição do técnico ao iniciar o atendimento
- Visualização em lista ou kanban
- Comentários públicos e notas internas (visíveis só para staff)

**Localização**
- Perfil do usuário com secretaria, setor e sala
- Localização editável a cada chamado — evita dados desatualizados do perfil

**Administração**
- Dashboard com métricas: total de chamados, status, tempo médio de resolução
- Gestão de usuários com alteração de perfil
- Gestão de categorias com proteção contra exclusão vinculada
- Gestão de convites com status (pendente, aceito, expirado)

**Notificações**
- Email automático ao mudar status do chamado
- Email ao receber nova resposta pública
- Suporte a Nodemailer com qualquer SMTP (Ethereal para desenvolvimento)

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + Fastify + TypeScript |
| ORM | Prisma 6 + PostgreSQL |
| Validação | Zod |
| Autenticação | JWT + HttpOnly Cookies |
| Frontend | React + Vite + TypeScript |
| UI | Shadcn/ui + Tailwind CSS v4 |
| Estado servidor | TanStack Query |
| Estado global | Zustand |
| Roteamento | React Router v6 |
| Email | Nodemailer |
| Infraestrutura | Docker + Docker Compose |
| Monorepo | npm Workspaces |
| Tipos compartilhados | packages/shared |

## Estrutura

```
helpdesk/
├── apps/
│   ├── api/          # Fastify + Prisma
│   └── web/          # React + Vite
├── packages/
│   └── shared/       # Enums e tipos compartilhados entre API e frontend
├── docker-compose.yml
└── package.json
```

## Como rodar localmente

**Pré-requisitos:** Node.js 20+, Docker

```bash
# 1. Clone o repositório
git clone https://github.com/viniizn/helpdesk.git
cd helpdesk

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp apps/api/.env.example apps/api/.env
# Edite o .env com suas configurações

# 4. Suba o banco de dados
docker-compose up db -d

# 5. Rode as migrations
cd apps/api
npx prisma migrate dev

# 6. Crie o primeiro admin direto no banco
npx prisma studio
# Na tabela User, crie um usuário com role ADMIN

# 7. Suba a API
npx tsx src/server.ts

# 8. Em outro terminal, suba o frontend
cd apps/web
npm run dev
```

Acesse `http://localhost:5173` e faça login com o admin criado.

## Variáveis de ambiente

```bash
# apps/api/.env
DATABASE_URL="postgresql://user:password@localhost:5432/helpdesk"
JWT_SECRET="min-32-caracteres"
COOKIE_SECRET="min-32-caracteres-diferente"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"

# SMTP (opcional em desenvolvimento — link de convite aparece no terminal)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
```

## Fluxo de acesso

```
Admin cria convite → Email enviado com link → 
Usuário define senha → Conta ativada → Login
```

Em desenvolvimento sem SMTP configurado, o link de convite aparece diretamente no terminal da API.

## Decisões técnicas

- **Monorepo com npm Workspaces** — tipos TypeScript definidos uma vez em `packages/shared` e reutilizados na API e no frontend sem duplicação
- **HttpOnly Cookies** — proteção contra XSS; o token JWT nunca é acessível via JavaScript no browser
- **Transições de status validadas** — impossível ir de `Aberto` direto para `Encerrado`; o fluxo é controlado no backend e refletido no frontend
- **Sem registro público** — acesso ao sistema só via convite do admin, adequado para ambientes corporativos internos
- **Snapshot de localização** — a localização é salva no chamado no momento da abertura, evitando que mudanças no perfil afetem chamados anteriores