import { and, count, eq, gte, inArray, sql, sum } from 'drizzle-orm'
import { db, schema } from '../../db'
import { requireRole } from '../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  await requireRole(event)

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [[active], [newLeads], [views], [soldThisMonth]] = await Promise.all([
    db
      .select({ n: count() })
      .from(schema.vehicles)
      .where(
        inArray(schema.vehicles.status, ['in_stock', 'on_order', 'reserved']),
      ),
    db
      .select({ n: count() })
      .from(schema.leads)
      .where(eq(schema.leads.status, 'new')),
    db
      .select({ n: sql<number>`coalesce(${sum(schema.vehicles.viewsCount)}, 0)` })
      .from(schema.vehicles),
    db
      .select({ n: count() })
      .from(schema.vehicles)
      .where(
        and(
          eq(schema.vehicles.status, 'sold'),
          gte(schema.vehicles.updatedAt, monthStart),
        ),
      ),
  ])

  return {
    activeVehicles: active.n,
    newLeads: newLeads.n,
    totalViews: Number(views.n),
    soldThisMonth: soldThisMonth.n,
  }
})
