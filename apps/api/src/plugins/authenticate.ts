import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export const authenticate = fp(async (app: FastifyInstance) => {
  app.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify()
      } catch {
        reply.status(401).send({ message: 'Não autorizado' })
      }
    }
  )
})