import { z } from 'zod'

export const updateProfileSchema = z.object({
  secretariat: z.string().min(2).max(100).optional(),
  department:  z.string().min(2).max(100).optional(),
  location:    z.string().min(2).max(100).optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>