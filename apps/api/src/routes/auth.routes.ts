import type { FastifyInstance } from 'fastify'
import { hash, compare } from 'bcrypt'
import { loginSchema } from '../schemas/auth.schema.js'
import { prisma } from '../plugins/prisma.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
} as const

export async function authRoutes(app: FastifyInstance) {

  app.post('/login', async (request, reply) => {
    const data = loginSchema.parse(request.body)

    const user = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (!user || !(await compare(data.password, user.passwordHash))) {
      return reply.status(401).send({ message: 'Credenciais inválidas' })
    }

    const token = app.jwt.sign(
      { sub: user.id, role: user.role },
      { expiresIn: '7d' }
    )

    reply.setCookie('auth_token', token, COOKIE_OPTIONS)

    return reply.send({
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    })
  })

  app.post('/logout', async (request, reply) => {
    reply.setCookie('auth_token', '', { ...COOKIE_OPTIONS, maxAge: 0 })
    return reply.send({ message: 'Deslogado com sucesso' })
  })

  app.get('/me', { onRequest: [app.authenticate] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where:  { id: request.user.sub },
      select: {
        id: true, name: true, email: true, role: true,
        secretariat: true, department: true, location: true,
      },
    })

    if (!user) return reply.status(404).send({ message: 'Usuário não encontrado' })

    return reply.send({ user })
  })
}