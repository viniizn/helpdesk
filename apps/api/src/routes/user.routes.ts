import type { FastifyInstance } from "fastify";
import { prisma } from "../plugins/prisma.js";
import { updateProfileSchema } from "../schemas/user.schema.js"

export async function userRoutes(app: FastifyInstance) {
    app.addHook("onRequest", app.authenticate)

    app.patch("/profile", async (request, reply) => {
        const data = updateProfileSchema.parse(request.body)

        const updated = await prisma.user.update({
            where:  { id: request.user.sub },
            data,
            select: {
                id: true, name: true, email: true, role: true,
                secretariat: true, department: true, location: true,
            },
        })

        return reply.send({ user: updated })
    })
}