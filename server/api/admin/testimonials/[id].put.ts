import { eq } from 'drizzle-orm'
import { db, schema } from '../../../db'
import { requireRole } from '../../../utils/admin-auth'
import { testimonialInputSchema } from '../../../utils/testimonial-input'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])
  const id = getRouterParam(event, 'id')!

  const parsed = testimonialInputSchema.partial().safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation failed' })
  }

  const [row] = await db
    .update(schema.testimonials)
    .set(parsed.data)
    .where(eq(schema.testimonials.id, id))
    .returning()
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Testimonial not found' })
  }
  return row
})
