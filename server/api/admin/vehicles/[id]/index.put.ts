import { eq } from 'drizzle-orm'
import { db, schema } from '../../../../db'
import { requireRole } from '../../../../utils/admin-auth'
import { vehicleInputSchema } from '../../../../utils/vehicle-input'

export default defineEventHandler(async (event) => {
  await requireRole(event)
  const id = getRouterParam(event, 'id')!

  const parsed = vehicleInputSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: parsed.error.flatten(),
    })
  }
  const { featureIds, ...input } = parsed.data

  // Slug is intentionally left unchanged on update (stable SEO URLs)
  const [vehicle] = await db
    .update(schema.vehicles)
    .set(input)
    .where(eq(schema.vehicles.id, id))
    .returning()
  if (!vehicle) {
    throw createError({ statusCode: 404, statusMessage: 'Vehicle not found' })
  }

  await db
    .delete(schema.vehicleFeatureMap)
    .where(eq(schema.vehicleFeatureMap.vehicleId, id))
  if (featureIds.length) {
    await db.insert(schema.vehicleFeatureMap).values(
      featureIds.map((featureId) => ({ vehicleId: id, featureId })),
    )
  }

  return vehicle
})
