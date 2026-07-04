import { eq } from 'drizzle-orm'
import { db, schema } from '../../../db'
import { requireRole } from '../../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])
  const id = getRouterParam(event, 'id')!

  const [deleted] = await db
    .delete(schema.sellers)
    .where(eq(schema.sellers.id, id))
    .returning({ id: schema.sellers.id })
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Seller not found' })
  }
  return { ok: true }
})
