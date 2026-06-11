import type { FastifyInstance } from "fastify"
import { prisma } from "../plugins/prisma.js";
import { authorize } from "../plugins/authorize.js"
import {
    updateUserRoleSchema,
    createCategorySchema,
    updateCategorySchema,
} from "../schemas/admin.schema.js"
import { number } from "zod";
import { tr } from "zod/v4/locales/index.js";

export async function adminRoutes(app: FastifyInstance) {
    //Todas as rotas exigem auth + role ADMIN
    app.addHook("onRequest", app.authenticate)
    app.addHook("onRequest", authorize("ADMIN")) //onRequest é um hook (ganho) 
    //executado no inicio de uma requisição, antes do Fastify processar a rota

    //Dashboard
    app.get("/dashboard", async (request, reply) => {
        const [
            totalTickets,
            openTickets,
            inProgressTickets,
            resolvedTickets,
            closedTickets,
            totalUsers,
            ticketsByPriority,
            ticketsByCategory,
            avgResolutionTime,
        ] = await prisma.$transaction([

            prisma.ticket.count(),
            prisma.ticket.count({ where: { status: "OPEN"}}),
            prisma.ticket.count({ where: { status: "IN_PROGRESS" }}),
            prisma.ticket.count({ where: { status: "RESOLVED" }}),
            prisma.ticket.count({ where: { status: "CLOSED" }}),
            prisma.user.count(),

            //Agrupa tickets por prioridade
            prisma.ticket.groupBy({
                by: ["priority"],
                _count: { id: true },
            }),

            //Agrupa tickets por categoria com nome da categoria
            prisma.ticket.groupBy({
                by: ["categoryId"],
                _count: { id: true },
                orderBy: { _count: { id: "desc" }},
                take: 5,
            }),

            //Tempo médio de resolução em horas / Tickets fechados/resolvidos
            prisma.$queryRaw<[{ avg_hours: number }]>`
                SELECT ROUND(
                AVG(
                    EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")) / 3600
                )::numeric, 1
                ) as avg_hours
                FROM "Ticket"
                WHERE status IN ('RESOLVED', 'CLOSED')
            `,
        ])

        //Busca os nomes das categorias separadamente
        const categoryIds = ticketsByCategory.map(c => c.categoryId)
        const categories = await prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true },
        })

        const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]))

        return reply.send({
            tickets: {
                total:      totalTickets,
                open:       openTickets,
                inProgress: resolvedTickets,
                closed:     closedTickets,
            },
            users: {
                total: totalUsers,
            },
            byPriority: ticketsByPriority.map(p => ({
                priority: p.priority,
                count:    p._count.id,
            })),
            byCategory: ticketsByCategory.map(c => ({
                category: categoryMap[c.categoryId] ?? "Desconhecida",
                count:    c._count.id,
            })),
            avgResolutionHours: avgResolutionTime[0]?.avg_hours ?? null,
        })
    })

    //Gestão de usuários
    app.get("/users", async (request, reply) => {
        const users = await prisma.user.findMany({
            select: {
                id:        true,
                name:      true,
                email:     true,
                role:      true,
                createdAt: true,
                //Conta os chamados criados e atribuidos por users
                _count: {
                    select: {
                        createdTickets: true,
                        assignedTickets: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return reply.send({ users })
    })

    app.patch("/users/:id/role", async (request, reply) => {
        const { id } = request.params as { id: string }
        const { role } = updateUserRoleSchema.parse(request.body)

        //Admin não pode tirar ele msm
        if (id === request.user.sub) {
            return reply.status(400).send({ message: "Não é possível alterar a própria função"})
        }

        const user = await prisma.user.findUnique({ where: { id } })

        if (!user) {
            return reply.status(404).send({ message: "Usuário não encontrado" })
        }

        const updated = await prisma.user.update({
            where:  { id },
            data:   { role },
            select: { id: true, name: true, email: true, role: true},
        })

        return reply.send({ user: updated})
    })

    app.get('/categories', async (request, reply) => {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                // Conta quantos tickets cada categoria tem
                _count: { select: { tickets: true } },
            },
        })

        return reply.send({ categories })
    })

    app.post("/categories", async (request, reply) => {
        const data = createCategorySchema.parse(request.body)

        const exists = await prisma.category.findUnique({
            where: { name: data.name },
        })

        if (exists) {
            return reply.status(409).send({ message: "Categoria já existe" })
        }

        const category = await prisma.category.create({ data })

        return reply.status(201).send({ category })
    })

    app.patch("/categories/:id", async (request, reply) => {
        const { id } = request.params as { id: string }
        const data   = updateCategorySchema.parse(request.body)

        const category = await prisma.category.findUnique({ where: { id } })

        if (!category) {
            return reply.status(404).send({ message: "Categoria não encontrada"})
        }

        const updated = await prisma.category.update({
            where: { id },
            data,
        })

        return reply.send({ category: updated })
    })

    app.delete("/categories/:id", async (request, reply) => {
        const { id } = request.params as { id: string }

        const category = await prisma.category.findUnique({
            where:      { id },
            include:    { _count: { select: { tickets: true } } },
        })

        if (!category) {
            return reply.status(404).send({ message: "Categoria não encontrada"})
        }

        //Não permite deletar categoria com chamados vinculados
        if (category._count.tickets > 0) {
            return reply.status(400).send({
                message: `Categoria possui ${category._count.tickets} chamado(s) vinculado(s) e não pode ser removida`,
            })
        }

        await prisma.category.delete({ where: { id }})
    })
}