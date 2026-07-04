import { db } from '../../../db'
import { requireRole } from '../../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])
  const rows = await db.query.settings.findMany()
  return Object.fromEntries(rows.map((r) => [r.key, r.value]))
})
