import { z } from "zod";

export const createCommentSchema = z.object({
    body: z.string().min(1, "Comentário não pode ser vazio").max(2000),

    isInternal: z.boolean().default(false),
    //true para comentários internos (visíveis apenas para técnicos)
    // false para comentários públicos (visíveis para clientes e equipe)
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>;