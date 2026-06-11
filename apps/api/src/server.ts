import Fastify from "fastify";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import { authRoutes } from "./routes/auth.routes.js";
import { authenticate } from "./plugins/authenticate.js";
import cors from "@fastify/cors";
import { ticketRoutes } from "./routes/ticket.routes.js";
import { commentRoutes } from "./routes/comment.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";

const app = Fastify({ logger: true})

//Cookie é registrado antes do JWT,
//Pq o plugin JWT vai ler o cookie via cookieName.
app.register(cookie, {
    secret: process.env.JWT_SECRET ?? "chave-secreta",
    //O secret assina o cookie para prevenir adulteração no cliente
    //Não é o msm q JWT_SECRET.
})

//Registra o plugin JWT com a chave secreta
//A chave fica no .env
app.register(jwt, {
    secret: process.env.JWT_SECRET ?? "chave-secreta",
    cookie: {
        cookieName: "auth_token",
        //O @fastify/jwt vai ler o token do cookie automaticamente
        //Qnd chamar o request.jwtVerify()
        signed: false,
        //False pois o JWT já tem assinatura própria.
    }
})

app.register(cors, {
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  // origin específica — nunca "*" quando usa cookies.
  // "*" + credentials é bloqueado pelo browser por segurança.

  credentials: true,
  // credentials: true — permite o browser enviar cookies
  // em requisições cross-origin para esta API.
})

app.register(authenticate);

app.register(adminRoutes, { prefix: '/admin' })

app.register(ticketRoutes, { prefix: "/tickets" })

app.register(commentRoutes, { prefix: "/tickets" })

//Registra as rotas de autenticação
app.register(authRoutes, { prefix: "/auth" })

app.listen({ port: 3333, host: "0.0.0.0"}, (err, address) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
    console.log(`Servidor rodando em ${address}`)
}); 