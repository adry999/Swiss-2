import { z } from 'zod'

export const sellerInputSchema = z.object({
  name: z.string().min(1).max(128),
  phone: z.string().min(1).max(32),
  whatsapp: z.string().max(32).nullable(),
  viber: z.string().max(32).nullable(),
  photoUrl: z.string().max(2048).nullable(),
  role: z.string().max(64).nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})
