import { z } from 'zod'
import { TicketStatus, TicketPriority } from '@helpdesk/shared'

export const createTicketSchema = z.object({
  title:       z.string().min(5, 'Título muito curto').max(120),
  description: z.string().min(20, 'Descrição muito curta'),
  priority:    z.nativeEnum(TicketPriority).default(TicketPriority.MEDIUM),
  categoryId:  z.string().cuid('Category ID inválido'),
})

// z.nativeEnum funciona com nosso padrão "as const".
// Valida que o valor recebido é um dos valores do enum — rejeita qualquer outro string.

export const updateTicketSchema = z.object({
  title:       z.string().min(5).max(120).optional(),
  description: z.string().min(20).optional(),
  priority:    z.nativeEnum(TicketPriority).optional(),
})

export const changeStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus),
})

export const assignTicketSchema = z.object({
  // nullable() permite mandar null para desatribuir um técnico
  agentId: z.string().cuid().nullable(),
})

export const listTicketsSchema = z.object({
  status:     z.nativeEnum(TicketStatus).optional(),
  priority:   z.nativeEnum(TicketPriority).optional(),
  assignedTo: z.string().cuid().optional(),
  // coerce converte string da query param para number automaticamente
  page:       z.coerce.number().min(1).default(1),
  limit:      z.coerce.number().min(1).max(100).default(20),
})

export type CreateTicketInput  = z.infer<typeof createTicketSchema>
export type UpdateTicketInput  = z.infer<typeof updateTicketSchema>
export type ChangeStatusInput  = z.infer<typeof changeStatusSchema>
export type AssignTicketInput  = z.infer<typeof assignTicketSchema>
export type ListTicketsInput   = z.infer<typeof listTicketsSchema>