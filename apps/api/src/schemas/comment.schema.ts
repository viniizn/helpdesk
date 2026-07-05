import { z } from "zod";

export const createCommentSchema = z.object({
    body: z.string().min(1, "Comentário não pode ser vazio").max(2000),

    isInternal: z.boolean().default(false),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>;