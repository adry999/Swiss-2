import { and, count, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { db, schema } from '../../../db'
import { requireRole } from '../../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  await requireRole(event)

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const perPage = Math.min(50, Number(query.perPage) || 20)
  const status = query.status as string | undefined
  const search = (query.q as string | undefined)?.trim()

  const conditions = []
  if (status) {
    conditions.push(eq(schema.vehicles.status, status as never))
  }
  if (search) {
    conditions.push(
      or(
        ilike(schema.makes.name, `%${search}%`),
        ilike(schema.models.name, `%${search}%`),
        ilike(schema.vehicles.productCode, `%${search}%`),
        ilike(schema.vehicles.vin, `%${search}%`),
      ),
    )
  }
  const where = conditions.length ? and(...conditions) : undefined

  const base = db
    .select({
      id: schema.vehicles.id,
      slug: schema.vehicles.slug,
      make: schema.makes.name,
      model: schema.models.name,
      year: schema.vehicles.year,
      price: schema.vehicles.price,
      priceType: schema.vehicles.priceType,
      status: schema.vehicles.status,
      mileageKm: schema.vehicles.mileageKm,
      productCode: schema.vehicles.productCode,
      viewsCount: schema.vehicles.viewsCount,
      isFeatured: schema.vehicles.isFeatured,
      createdAt: schema.vehicles.createdAt,
      thumbnailUrl: sql<string | null>`(
        select coalesce(vp.thumbnail_url, vp.url) from vehicle_photos vp
        where vp.vehicle_id = ${schema.vehicles.id}
        order by vp.is_primary desc, vp.sort_order asc limit 1
      )`,
    })
    .from(schema.vehicles)
    .innerJoin(schema.makes, eq(schema.vehicles.makeId, schema.makes.id))
    .innerJoin(schema.models, eq(schema.vehicles.modelId, schema.models.id))

  const [items, [{ total }]] = await Promise.all([
    base
      .where(where)
      .orderBy(desc(schema.vehicles.createdAt))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db
      .select({ total: count() })
      .from(schema.vehicles)
      .innerJoin(schema.makes, eq(schema.vehicles.makeId, schema.makes.id))
      .innerJoin(schema.models, eq(schema.vehicles.modelId, schema.models.id))
      .where(where),
  ])

  return { items, total, page, perPage }
})
