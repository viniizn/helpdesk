import { z } from "zod";
import { UserRole } from "@helpdesk/shared"

export const updateUserRoleSchema = z.object({
    role: z.nativeEnum(UserRole),
})

export const createCategorySchema = z.object({
    name: z.string().min(2).max(60),
    description: z.string().max(200).optional(),
})

export const updateCategorySchema = createCategorySchema.partial()

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>