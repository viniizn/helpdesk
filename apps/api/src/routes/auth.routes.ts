import type { FastifyInstance } from 'fastify'
import { hash, compare } from 'bcrypt'
import { registerSchema, loginSchema } from '../schemas/auth.schema.js'
import { prisma } from '../plugins/prisma.js'

const COOKIE_OPTIONS = {
    httpOnly: true,
    //JS browser não consegue ler esse cookie.
    //document.cookie não mostra. XSS não rouba.

    secure: process.env.NODE_ENV === 'production',
    //Cookie só vai em https
    //Em DEV (HTTP) fica em false pra nao travar fluxo local
    //Em produção fica true

    sameSite: 'strict' as const,
    //Proteção contra CSRF. Cookie só é enviado em requisições do mesmo site.
    //"lax" é mais flexível, mas "strict" é mais seguro.

    path: '/',
    //Cookie é enviado em todas as rotas. Pode ser limitado a /auth se quiser.

    maxAge: 60 * 60 * 24 * 7, // 7 dias
} as const

//FastifyInstance é o tipo do servidor Fastify.
//Tipar o parâmetro "app" garante autocomplete nas rotas.

export async function authRoutes(app: FastifyInstance) {

    app.post('/register', async (request, reply) => {
        const data = registerSchema.parse(request.body)

        const exists = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (exists) {
            return reply.status(409).send({ message: 'Email já cadastrado' })
        }

        const passwordHash = await hash(data.password, 12)

        const user = await prisma.user.create({
            data: {
                name:     data.name,
                email:    data.email,
                passwordHash,
            },
            select: { id: true, name: true, email: true, role: true }
        })

        const token = app.jwt.sign(
            { sub: user.id, role: user.role },
            { expiresIn: '7d' }
        )

        reply.setCookie('auth_token', token, COOKIE_OPTIONS)

        return reply.status(201).send(user)
    })

    app.post('/login', async (request, reply) => {
        const data = loginSchema.parse(request.body)

        const user = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (!user || !(await compare(data.password, user.passwordHash))){
            return reply.status(401).send({ message: 'Credenciais inválidas' })
        }

        const token = app.jwt.sign(
            { sub: user.id, role: user.role },
            { expiresIn: '7d' }
        )

        reply.setCookie('auth_token', token, COOKIE_OPTIONS)

        return reply.send({ 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
         })
    })

    app.post('/logout', async (request, reply) => {
        
        // Limpar cookie: maxAge: 0 faz o browser descartar imediatamente.
        reply.setCookie('auth_token', '', { ...COOKIE_OPTIONS, maxAge: 0 })
        return reply.send({ message: 'Deslogado com sucesso' })
    })

    //Rota para o frontend saber quem ta logado ao recarregar pagina
    //Cookie enviado automaticamente, sem precisar de localStorage.
    app.get("/me", { onRequest: [app.authenticate] }, async (request, reply) => {
        const user = await prisma.user.findUnique({
            where: { id: request.user.sub },
            select: { id: true, name: true, email: true, role: true }
        })

        if (!user) {
            return reply.status(404).send({ message: 'Usuário não encontrado' })
        }

        return reply.send({ user });
    })
}   