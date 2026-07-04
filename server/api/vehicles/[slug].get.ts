import { eq, sql } from 'drizzle-orm'
import { db, schema } from '../../db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!

  const vehicle = await db.query.vehicles.findFirst({
    where: (t, { eq }) => eq(t.slug, slug),
    with: {
      make: true,
      model: true,
      photos: {
        orderBy: (t, { asc, desc }) => [desc(t.isPrimary), asc(t.sortOrder)],
      },
      featureMap: { with: { feature: true } },
      assignedSeller: {
        columns: {
          id: true,
          name: true,
          phone: true,
          whatsapp: true,
          viber: true,
          photoUrl: true,
          role: true,
          isActive: true,
        },
      },
    },
  })
  if (!vehicle) {
    throw createError({ statusCode: 404, statusMessage: 'Vehicle not found' })
  }

  // Fire-and-forget view counter
  db.update(schema.vehicles)
    .set({ viewsCount: sql`${schema.vehicles.viewsCount} + 1` })
    .where(eq(schema.vehicles.id, vehicle.id))
    .then(
      () => {},
      () => {},
    )

  const similar = await db
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
      thumbnailUrl: sql<string | null>`(
        select coalesce(vp.thumbnail_url, vp.url) from vehicle_photos vp
        where vp.vehicle_id = ${schema.vehicles.id}
        order by vp.is_primary desc, vp.sort_order asc limit 1
      )`,
    })
    .from(schema.vehicles)
    .innerJoin(schema.makes, eq(schema.vehicles.makeId, schema.makes.id))
    .innerJoin(schema.models, eq(schema.vehicles.modelId, schema.models.id))
    .where(
      sql`${schema.vehicles.id} != ${vehicle.id}
        and ${schema.vehicles.status} in ('in_stock', 'on_order')
        and (${schema.vehicles.bodyType} = ${vehicle.bodyType ?? null}
          or ${schema.vehicles.makeId} = ${vehicle.makeId})`,
    )
    .orderBy(sql`random()`)
    .limit(4)

  const { featureMap, assignedSeller, ...rest } = vehicle
  return {
    ...rest,
    features: featureMap.map((f) => f.feature.code),
    seller: assignedSeller?.isActive ? assignedSeller : null,
    similar,
  }
})
