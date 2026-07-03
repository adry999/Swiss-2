import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '../../../db'
import { requireRole } from '../../../utils/admin-auth'

const bodySchema = z.object({
  status: z.enum(['new', 'contacted', 'closed']).optional(),
  assignedSellerId: z.string().uuid().nullable().optional(),
})

export default defineEventHandler(async (event) => {
  await requireRole(event)
  const id = getRouterParam(event, 'id')!

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation failed' })
  }

  const [lead] = await db
    .update(schema.leads)
    .set(parsed.data)
    .where(eq(schema.leads.id, id))
    .returning()
  if (!lead) {
    throw createError({ statusCode: 404, statusMessage: 'Lead not found' })
  }
  return lead
})
