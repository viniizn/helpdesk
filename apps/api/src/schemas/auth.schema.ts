import { z } from "zod";

export const registerSchema = z.object({
    name:     z.string().min(2).max(100),
    email:    z.string().email(),
    //Regex mínimo 8 chars, 1 maiúscula, 1 núemro
    password: z.string().min(8).regex(
        /^(?=.*[A-Z])(?=.*\d)/,
        'Mínimo 8 caracteres, 1 maiúscula e 1 número'
    ),
});

export const loginSchema = z.object({
    email:    z.string().email(),
    password: z.string().min(1),
})

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;