import type { FastifyInstance } from 'fastify'
import { hash } from 'bcrypt'
import { prisma } from '../plugins/prisma.js'
import { authorize } from '../plugins/authorize.js'
import { createInviteSchema, acceptInviteSchema } from '../schemas/invite.schema.js'
import { sendInviteEmail } from '../plugins/mailer.js'


export async function inviteRoutes(app: FastifyInstance) {
    app.post(
        "/invite",
        { onRequest: [app.authenticate, authorize("ADMIN")] },
        async (request, reply) => {
            const data = createInviteSchema.parse(request.body)

            //Verifica se existe user com esse email
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email },
            })

            if (existingUser) {
                return reply.status(409).send({ message: "Já existe um usuário com esse email" })

            }

            //Verifica se já existe convite
            const existingInvite = await prisma.invite.findUnique({
                where: { email: data.email },
            })

            if (existingInvite && !existingInvite.usedAt && existingInvite.expiresAt > new Date()) {
                return reply.status(409).send({ message: "Já existe um convite pendente para esse email" })
            }

            //Deletar convite expirado e criar novo
            if (existingInvite) {
                await prisma.invite.delete({ where: { email: data.email }})
            }

            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + 3) //Expirar em 3 dias o convite

            const invite = await prisma.invite.create({
                data: {
                    name:   data.name,
                    email:  data.email,
                    role:   data.role,
                    expiresAt,
                },
            })

            await sendInviteEmail({
                to:     invite.email,
                name:   invite.name,
                token:  invite.token,
                role:   invite.role,
            })

            return reply.status(201).send({
                message: "Convite enviado",
                ...(process.env.NODE_ENV !== 'production' && {
                    devLink: `${process.env.FRONTEND_URL}/accept-invite?token=${invite.token}`,
               }),
            })
        }
    )

    //Listando convites - Admin
    app.get(
        "/invites",
        { onRequest: [app.authenticate, authorize("ADMIN")] },
        async (request, reply) => {
            const invites = await prisma.invite.findMany({
                orderBy: { createdAt: "desc" },
            })

            return reply.send({
                invites: invites.map(i => ({
                id:        i.id,
                name:      i.name,
                email:     i.email,
                role:      i.role,
                expiresAt: i.expiresAt,
                usedAt:    i.usedAt,
                // Status legível
                status: i.usedAt
                    ? 'accepted'
                    : i.expiresAt < new Date()
                    ? 'expired'
                    : 'pending',
                })),
            })
        }
    )

    //Verifica o token - usada pelo frontend
    app.get("/invites/:token", async (request, reply) => {
        const { token } = request.params as { token: string }

        const invite = await prisma.invite.findUnique({ where: { token } })

        if (!invite) {
            return reply.status(404).send({ message: "Convite não encontrado" })
        }

        if (invite.usedAt) {
            return reply.status(410).send({ message: "Este convite já foi utilizado" })
        }

        if (invite.expiresAt < new Date()) {
            return reply.status(410).send({ message: "Este convite já expirou" })
        }

        return reply.send({
            invite: {
                name:   invite.name,
                email:  invite.email,
                role:   invite.role,
            },
        })
    })

    app.post("/invites/accept", async (request, reply) => {
        const { token, password } = acceptInviteSchema.parse(request.body)

        const invite = await prisma.invite.findUnique({ where: { token } })

        if (!invite) {
            return reply.status(404).send({ message: "Convite não encontrado" })
        }

        if (invite.usedAt) {
            return reply.status(410).send({ message: "Este convite já foi utilizado" })
        }

        if (invite.expiresAt < new Date()) {
            return reply.status(410).send({ message: "Este convite já expirou" })
        }

        const passwordHash = await hash(password, 12)

        const user = await prisma.$transaction(async (tx) => {
            const created = await tx.user.create({
                data: {
                    name:   invite.name,
                    email:  invite.email,
                    role:   invite.role,
                    passwordHash,
                },
                select: { id: true, name: true, email: true, role: true },
            })

            await tx.invite.update({
                where: { token },
                data:  { usedAt: new Date() },
            })

            return created
        })

        return reply.status(201).send({
            message: "Conta criada com sucesso",
            user,
        })
    })
}