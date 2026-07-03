import { and, asc, count, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm'
import { db, schema } from '../../db'

const PUBLIC_STATUSES = ['in_stock', 'on_order', 'reserved'] as const

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const perPage = Math.min(48, Number(q.perPage) || 12)

  const conditions = []

  const status = q.status as string | undefined
  if (status && (PUBLIC_STATUSES as readonly string[]).includes(status)) {
    conditions.push(eq(schema.vehicles.status, status as never))
  } else {
    conditions.push(inArray(schema.vehicles.status, [...PUBLIC_STATUSES]))
  }

  if (q.makeId) conditions.push(eq(schema.vehicles.makeId, Number(q.makeId)))
  if (q.modelId) conditions.push(eq(schema.vehicles.modelId, Number(q.modelId)))
  if (q.priceMin) conditions.push(gte(schema.vehicles.price, Number(q.priceMin)))
  if (q.priceMax) conditions.push(lte(schema.vehicles.price, Number(q.priceMax)))
  if (q.yearMin) conditions.push(gte(schema.vehicles.year, Number(q.yearMin)))
  if (q.yearMax) conditions.push(lte(schema.vehicles.year, Number(q.yearMax)))
  if (q.mileageMax) {
    conditions.push(lte(schema.vehicles.mileageKm, Number(q.mileageMax)))
  }
  if (q.fuelType) {
    conditions.push(eq(schema.vehicles.fuelType, String(q.fuelType) as never))
  }
  if (q.transmission) {
    conditions.push(
      eq(schema.vehicles.transmission, String(q.transmission) as never),
    )
  }
  if (q.bodyType) {
    conditions.push(eq(schema.vehicles.bodyType, String(q.bodyType) as never))
  }
  if (q.featured === '1') conditions.push(eq(schema.vehicles.isFeatured, true))

  const where = and(...conditions)

  const sortMap = {
    newest: desc(schema.vehicles.createdAt),
    price_asc: asc(schema.vehicles.price),
    price_desc: desc(schema.vehicles.price),
    year_desc: desc(schema.vehicles.year),
  } as const
  const sort = sortMap[(q.sort as keyof typeof sortMap) ?? 'newest'] ?? sortMap.newest

  const [items, [{ total }]] = await Promise.all([
    db
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
        fuelType: schema.vehicles.fuelType,
        transmission: schema.vehicles.transmission,
        estimatedDeliveryDays: schema.vehicles.estimatedDeliveryDays,
        photoUrl: sql<string | null>`(
          select vp.url from vehicle_photos vp
          where vp.vehicle_id = ${schema.vehicles.id}
          order by vp.is_primary desc, vp.sort_order asc limit 1
        )`,
        thumbnailUrl: sql<string | null>`(
          select coalesce(vp.thumbnail_url, vp.url) from vehicle_photos vp
          where vp.vehicle_id = ${schema.vehicles.id}
          order by vp.is_primary desc, vp.sort_order asc limit 1
        )`,
      })
      .from(schema.vehicles)
      .innerJoin(schema.makes, eq(schema.vehicles.makeId, schema.makes.id))
      .innerJoin(schema.models, eq(schema.vehicles.modelId, schema.models.id))
      .where(where)
      .orderBy(sort, desc(schema.vehicles.id))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db.select({ total: count() }).from(schema.vehicles).where(where),
  ])

  return { items, total, page, perPage }
})
