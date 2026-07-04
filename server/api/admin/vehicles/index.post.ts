import { db, schema } from '../../../db'
import { requireRole } from '../../../utils/admin-auth'
import { generateProductCode, generateVehicleSlug } from '../../../utils/vehicle-codes'
import { vehicleInputSchema } from '../../../utils/vehicle-input'

export default defineEventHandler(async (event) => {
  await requireRole(event)

  const parsed = vehicleInputSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: parsed.error.flatten(),
    })
  }
  const { featureIds, ...input } = parsed.data

  const make = await db.query.makes.findFirst({
    where: (t, { eq }) => eq(t.id, input.makeId),
  })
  const model = await db.query.models.findFirst({
    where: (t, { eq, and }) =>
      and(eq(t.id, input.modelId), eq(t.makeId, input.makeId)),
  })
  if (!make || !model) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid make/model' })
  }

  const [vehicle] = await db
    .insert(schema.vehicles)
    .values({
      ...input,
      slug: generateVehicleSlug(make.name, model.name, input.year),
      productCode: generateProductCode(),
    })
    .returning()

  if (featureIds.length) {
    await db.insert(schema.vehicleFeatureMap).values(
      featureIds.map((featureId) => ({ vehicleId: vehicle.id, featureId })),
    )
  }

  return vehicle
})
