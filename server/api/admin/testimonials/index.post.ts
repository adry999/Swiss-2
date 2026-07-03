import { db, schema } from '../../../db'
import { requireRole } from '../../../utils/admin-auth'
import { testimonialInputSchema } from '../../../utils/testimonial-input'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])

  const parsed = testimonialInputSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation failed' })
  }

  const [row] = await db
    .insert(schema.testimonials)
    .values(parsed.data)
    .returning()
  return row
})
