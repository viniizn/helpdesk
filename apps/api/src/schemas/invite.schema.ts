import { z } from "zod";
import { UserRole } from "@helpdesk/shared"

export const createInviteSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    role: z.nativeEnum(UserRole).default(UserRole.USER),
})

export const acceptInviteSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8).regex(
    /^(?=.*[A-Z])(?=.*\d)/,
    'Mínimo 8 caracteres, 1 maiúscula e 1 número'
    )
})

export type CreateInviteInput = z.infer<typeof createInviteSchema>
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>