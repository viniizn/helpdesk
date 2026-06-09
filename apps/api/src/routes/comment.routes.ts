import type { FastifyInstance } from 'fastify';
import { prisma } from "../plugins/prisma.js";
import { createCommentSchema } from '../schemas/comment.schema.js';
import { sendTicketStatusEmail } from "../plugins/mailer.js";

export async function commentRoutes(app: FastifyInstance) {
    app.addHook("onRequest", app.authenticate)

    //Add comentário
    app.post("/:ticketId/comments", async (request, reply) => {
        const { ticketId } = request.params as { ticketId: string };
        const data = createCommentSchema.parse(request.body);

        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: { 
                createdBy: { select: { id: true, name: true, email: true } },
            },
        })

        if (!ticket) {
            return reply.status(404).send({ message: "Chamado não encontrado" });
        }

        //User comum não pode fzr comentário interno
        if (data.isInternal && request.user.role === "USER") {
            return reply.status(403).send({ message: "Usuário não autorizado a criar comentário interno" });
        }

        //User comum só comenta nos próprios tickets
        if (request.user.role === "USER" && ticket.createdById !== request.user.sub) {
            return reply.status(403).send({ message: "Usuário não autorizado a comentar neste chamado" });
        }

        const comment = await prisma.comment.create({
            data: {
                body: data.body,
                isInternal: data.isInternal,
                ticketId,
                authorId: request.user.sub,
            },
            include: {
                author: { select: { id: true, name: true, role: true } },
            },
        })

        //Notifica o dono do chamado qnd agente/admin responde publicamente
        if (!data.isInternal && request.user.role !== "USER") {
            await sendTicketStatusEmail({
                to: ticket.createdBy.email,
                userName: ticket.createdBy.name,
                ticketId: ticket.id,
                ticketTitle: ticket.title,
                eventType: "new_comment",
            })
        }
        
        return reply.status(201).send({ comment })
    })

    //Listar comentários de um chamado
    app.get("/:ticketId/comments", async (request, reply) => {
        const { ticketId } = request.params as { ticketId: string };
        const isUser = request.user.role === "USER";

        const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })

        if (!ticket) {
            return reply.status(404).send({ message: "Chamado não encontrado" });
        }

        //User comum só vê comentários dos próprios tickets
        if (isUser && ticket.createdById !== request.user.sub) {
            return reply.status(403).send({ message: "Usuário não autorizado a ver comentários deste chamado" });
        }

        const comments = await prisma.comment.findMany({
            where: { 
                ticketId,
                //User não ve comentários internos
                ...(isUser && { isInternal: false }),
            },
            orderBy: { createdAt: "asc" },
            include: {
                author: { select: { id: true, name: true, role: true } },
            },
        })

        return reply.send({ comments })
    })
}