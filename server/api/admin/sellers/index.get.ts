import { db } from '../../../db'
import { requireRole } from '../../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  await requireRole(event)
  return db.query.sellers.findMany({
    orderBy: (t, { asc }) => [asc(t.sortOrder), asc(t.name)],
  })
})
