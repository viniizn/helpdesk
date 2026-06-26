import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserRole } from "@helpdesk/shared"

export function authorize(...roles: UserRole[]) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        if (!roles.includes(request.user.role as UserRole)) {
            return reply.status(403).send({ message: "Acesso negado" })
        }
    }
}