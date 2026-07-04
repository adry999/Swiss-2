import { z } from 'zod'

export const testimonialInputSchema = z.object({
  authorName: z.string().min(1).max(128),
  text: z.string().min(1),
  rating: z.number().int().min(1).max(5).default(5),
  isVisible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})
