import type { FastifyInstance } from 'fastify';
import { prisma } from "../plugins/prisma.js";
import { isValidTransition } from '@helpdesk/shared';
import { 
  createTicketSchema, 
  updateTicketSchema, 
  changeStatusSchema, 
  assignTicketSchema, 
  listTicketsSchema,
} from '../schemas/ticket.schema.js';
import { sendTicketStatusEmail } from '../plugins/mailer.js';

export async function ticketRoutes(app: FastifyInstance) {

    //Todas as rotas exigem auth
    app.addHook("onRequest", app.authenticate);

    app.get('/categories', async (request, reply) => {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
            select:  { id: true, name: true },
        })
        return reply.send({ categories })
    })

    //Criar ticket
    app.post("/", async (request, reply) => {
        const data = createTicketSchema.parse(request.body);

        const category = await prisma.category.findUnique({
            where: { id: data.categoryId },
        });

        if (!category) {
            return reply.status(400).send({ error: "Categoria não encontrada" });
        }

        const ticket = await prisma.ticket.create({
            data: {
                title: data.title,
                description: data.description,
                priority: data.priority,
                categoryId: data.categoryId,
                createdById: request.user.sub,
                location: data.location,
            },
            include: {
                category: { select: { id: true, name: true } },
                createdBy: {
                    select: {
                        id: true, name: true,
                        secretariat: true, department: true, location: true,
                    },
                },
            },
        });

        return reply.status(201).send({ ticket });
    });

    //Listar tickets
    app.get("/", async (request, reply) => {
        const filters = listTicketsSchema.parse(request.query);

        //User comum so ve os proprios tickets
        //Agente e admin veem todos
        const isUser = request.user.role === "USER";

        const where = {
        // Se for usuário, força filtro pelo próprio id
        ...(isUser && { createdById: request.user.sub }),
        ...(filters.status     && { status:       filters.status }),
        ...(filters.priority   && { priority:     filters.priority }),
        ...(filters.assignedTo && { assignedToId: filters.assignedTo }),
        }

        const [tickets, total] = await prisma.$transaction([
            prisma.ticket.findMany({
                where,
                skip: (filters.page - 1) * filters.limit,
                take: filters.limit,
                orderBy: { createdAt: "desc" },
                include: {
                    category: { select: { id: true, name: true } },
                    createdBy: {
                        select: {
                            id: true, name: true,
                            secretariat: true, department: true, location: true,
                        },
                    },
                    assignedTo: { select: { id: true, name: true } },
                },
            }),
            prisma.ticket.count({ where }),
        ]);

        return reply.send({
            tickets,
            meta: {
                total,
                page: filters.page,
                limit: filters.limit,
                totalPages: Math.ceil(total / filters.limit),
            },
        })
    });

    //Buscar tickets por id
    app.get("/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        const isUser = request.user.role === "USER";

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                category: { select: { id: true, name: true } },
                createdBy: {
                    select: {
                        id: true, name: true,
                        secretariat: true, department: true, location: true,
                    },
                },
                assignedTo: { select: { id: true, name: true } },
                comments: {
                    where: isUser ? { isInternal: false } : {},
                    orderBy: { createdAt: "asc" },
                    include: { author: { select: { id: true, name: true, role: true } } },
                },
            },
        });

        if (!ticket) {
            return reply.status(404).send({ error: "Ticket não encontrado" });
        }

        //User comum so ve os proprios tickets
        if (isUser && ticket.createdById !== request.user.sub) {
            return reply.status(403).send({ message: "Acesso negado" });
        }

        return reply.send({ ticket });
    });

    app.patch("/:id/status", async (request, reply) => {
        const { id } = request.params as { id: string };
        const { status: newStatus } = changeStatusSchema.parse(request.body)

        const ticket = await prisma.ticket.findUnique({ where: { id } });

        if (!ticket) {
            return reply.status(404).send({ error: "Chamado não encontrado" });
        }

        if (request.user.role === "USER") {
            return reply.status(403).send({ message: "Acesso negado" });
        }

        if (!isValidTransition(ticket.status as any, newStatus)) {
            return reply.status(400).send({
                message: `Transição inválida: ${ticket.status} → ${newStatus}`,
            })
        }

        const shouldAssign = newStatus === 'IN_PROGRESS' && !ticket.assignedToId

        const updated = await prisma.ticket.update({
            where: { id },
            data: {
                status: newStatus,
                ...(shouldAssign && { assignedToId: request.user.sub }),
            },
            include: {
                createdBy:  { select: { id: true, name: true, email: true } },
                assignedTo: { select: { id: true, name: true } },
            },
        });

        await sendTicketStatusEmail({
            to:          updated.createdBy.email,
            userName:    updated.createdBy.name,
            ticketId:    updated.id,
            ticketTitle: updated.title,
            eventType:   'status_changed',
            newStatus:   updated.status,
        })

        return reply.send({ ticket: updated });
    });

    //Atribuir técnico
    app.patch("/:id/assign", async (request, reply) => {
        const { id }        = request.params as { id: string };
        const { agentId }   = assignTicketSchema.parse(request.body);

        //Só admin atribui técnicos
        if (request.user.role !== "ADMIN") {
            return reply.status(403).send({ message: "Acesso negado" });
        }
        
        const ticket = await prisma.ticket.findUnique({ where: { id } });

        if (!ticket) {
            return reply.status(404).send({ error: "Chamado não encontrado" });
        }

        //Se agentId não for null, verifica se técnico existe e tem role AGENT
        if (agentId !== null) {
            const agent = await prisma.user.findUnique({ where: { id: agentId } });

            if (!agent || agent.role === "USER") {
                return reply.status(400).send({ error: "Técnico inválido" });
            }
        }

        const updated = await prisma.ticket.update({
            where: { id },
            data:  { assignedToId: agentId },
            include: {
                assignedTo: { select: { id: true, name: true } },
            },
        })
        return reply.send({ ticket: updated })
    })

        //Atualizar ticket (titulo, descricao, prioridade)
    app.patch("/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        const data = updateTicketSchema.parse(request.body);

        const ticket = await prisma.ticket.findUnique({ where: { id } });

        if (!ticket) {
            return reply.status(404).send({ error: "Chamado não encontrado" });
        }

        //Só o criador/admin podem editar
        const isAdmin = request.user.role === "ADMIN";
        if (!isAdmin && ticket.createdById !== request.user.sub) {
            return reply.status(403).send({ message: "Acesso negado" });
        }

        //Ticket fechado nao pode ser editado
        if (ticket.status === "CLOSED") {
            return reply.status(400).send({ message: "Chamado encerrado não pode ser editado" });
        }

        const updated = await prisma.ticket.update({
            where: { id },
            data,
        });

        return reply.send({ ticket: updated });
    });
}