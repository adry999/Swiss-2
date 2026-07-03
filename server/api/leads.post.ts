import { z } from 'zod'
import { db, schema } from '../db'

const bodySchema = z.object({
  type: z.enum(['order_request', 'contact', 'financing', 'callback']),
  vehicleId: z.string().uuid().nullish(),
  name: z.string().min(2).max(128),
  phone: z.string().min(5).max(32),
  email: z.string().email().max(128).nullish(),
  message: z.string().max(4000).nullish(),
  budget: z.number().int().positive().nullish(),
  referenceLinks: z.string().max(2000).nullish(),
  // Honeypot: bots fill it, humans never see it
  website: z.string().max(0).optional(),
})

export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation failed' })
  }
  const { website: _honeypot, ...input } = parsed.data

  if (input.vehicleId) {
    const vehicle = await db.query.vehicles.findFirst({
      where: (t, { eq }) => eq(t.id, input.vehicleId!),
      columns: { id: true },
    })
    if (!vehicle) input.vehicleId = null
  }

  await db.insert(schema.leads).values({
    type: input.type,
    vehicleId: input.vehicleId ?? null,
    name: input.name,
    phone: input.phone,
    email: input.email ?? null,
    message: input.message ?? null,
    budget: input.budget ?? null,
    referenceLinks: input.referenceLinks ?? null,
  })

  return { ok: true }
})
