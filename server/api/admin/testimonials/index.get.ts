import { db } from '../../../db'
import { requireRole } from '../../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])
  return db.query.testimonials.findMany({
    orderBy: (t, { asc, desc }) => [asc(t.sortOrder), desc(t.createdAt)],
  })
})
