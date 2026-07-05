# Helpdesk

Sistema de gerenciamento de chamados desenvolvido para simular um ambiente corporativo de suporte técnico. O projeto possui autenticação, controle de acesso por perfis, gerenciamento de chamados e dashboard administrativo.

## Funcionalidades

* Autenticação com JWT utilizando HttpOnly Cookies
* Controle de acesso por perfis (Usuário, Técnico e Administrador)
* Cadastro de usuários por convite
* Abertura e gerenciamento de chamados
* Fluxo de status com transições validadas
* Comentários públicos e notas internas
* Dashboard com métricas
* Gerenciamento de usuários e categorias
* Notificações por e-mail

## Tecnologias

### Backend

* Node.js
* Fastify
* TypeScript
* Prisma ORM
* PostgreSQL
* Zod
* JWT
* Nodemailer

### Frontend

* React
* Vite
* TypeScript
* Tailwind CSS
* shadcn/ui
* TanStack Query
* Zustand
* React Router

### Infraestrutura

* Docker
* Docker Compose
* npm Workspaces

## Estrutura

```text
helpdesk/
├── apps/
│   ├── api/
│   └── web/
├── packages/
│   └── shared/
└── docker-compose.yml
```

## Executando o projeto

### Pré-requisitos

* Node.js 20 ou superior
* Docker

Clone o repositório:

```bash
git clone https://github.com/viniizn/helpdesk.git
cd helpdesk
```

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente:

```bash
cp apps/api/.env.example apps/api/.env
```

Inicie o banco de dados:

```bash
docker compose up -d
```

Execute as migrations:

```bash
cd apps/api
npx prisma migrate dev
```

Inicie a API:

```bash
npm run dev
```

Em outro terminal, inicie o frontend:

```bash
cd apps/web
npm run dev
```

O frontend ficará disponível em `http://localhost:5173`.

## Licença

Projeto desenvolvido para fins de estudo e portfólio.
