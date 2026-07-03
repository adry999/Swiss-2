import { db } from '../../../db'
import { requireRole } from '../../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  await requireRole(event)
  const [makes, features] = await Promise.all([
    db.query.makes.findMany({
      orderBy: (t, { asc }) => [asc(t.sortOrder), asc(t.name)],
      with: { models: { orderBy: (t, { asc }) => [asc(t.name)] } },
    }),
    db.query.features.findMany({
      orderBy: (t, { asc }) => [asc(t.sortOrder), asc(t.code)],
    }),
  ])
  return { makes, features }
})
