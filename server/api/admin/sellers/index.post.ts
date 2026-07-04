import { db, schema } from '../../../db'
import { requireRole } from '../../../utils/admin-auth'
import { sellerInputSchema } from '../../../utils/seller-input'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])

  const parsed = sellerInputSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation failed' })
  }

  const [seller] = await db.insert(schema.sellers).values(parsed.data).returning()
  return seller
})
