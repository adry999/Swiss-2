import { db } from '../../../../db'
import { requireRole } from '../../../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  await requireRole(event)
  const id = getRouterParam(event, 'id')!

  const vehicle = await db.query.vehicles.findFirst({
    where: (t, { eq }) => eq(t.id, id),
    with: {
      photos: { orderBy: (t, { asc, desc }) => [desc(t.isPrimary), asc(t.sortOrder)] },
      featureMap: true,
      make: true,
      model: true,
    },
  })
  if (!vehicle) {
    throw createError({ statusCode: 404, statusMessage: 'Vehicle not found' })
  }

  const { featureMap, ...rest } = vehicle
  return { ...rest, featureIds: featureMap.map((f) => f.featureId) }
})
