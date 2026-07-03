import { eq } from 'drizzle-orm'
import { db, schema } from '../../../db'
import { requireRole } from '../../../utils/admin-auth'
import { sellerInputSchema } from '../../../utils/seller-input'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])
  const id = getRouterParam(event, 'id')!

  const parsed = sellerInputSchema.partial().safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation failed' })
  }

  const [seller] = await db
    .update(schema.sellers)
    .set(parsed.data)
    .where(eq(schema.sellers.id, id))
    .returning()
  if (!seller) {
    throw createError({ statusCode: 404, statusMessage: 'Seller not found' })
  }
  return seller
})
