import { and, count, desc, eq } from 'drizzle-orm'
import { db, schema } from '../../../db'
import { requireRole } from '../../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  await requireRole(event)

  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const perPage = Math.min(50, Number(q.perPage) || 20)

  const conditions = []
  if (q.type) conditions.push(eq(schema.leads.type, String(q.type) as never))
  if (q.status) {
    conditions.push(eq(schema.leads.status, String(q.status) as never))
  }
  const where = conditions.length ? and(...conditions) : undefined

  const [items, [{ total }]] = await Promise.all([
    db.query.leads.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      limit: perPage,
      offset: (page - 1) * perPage,
      with: {
        vehicle: {
          columns: { id: true, slug: true, year: true },
          with: {
            make: { columns: { name: true } },
            model: { columns: { name: true } },
          },
        },
        assignedSeller: { columns: { id: true, name: true } },
      },
    }),
    db.select({ total: count() }).from(schema.leads).where(where),
  ])

  return { items, total, page, perPage }
})
