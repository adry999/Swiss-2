import { eq, max } from 'drizzle-orm'
import { db, schema } from '../../../../db'
import { requireRole } from '../../../../utils/admin-auth'
import { storeVehicleImage } from '../../../../utils/storage'

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15 MB per file

export default defineEventHandler(async (event) => {
  await requireRole(event)
  const vehicleId = getRouterParam(event, 'id')!

  const vehicle = await db.query.vehicles.findFirst({
    where: (t, { eq }) => eq(t.id, vehicleId),
    columns: { id: true },
  })
  if (!vehicle) {
    throw createError({ statusCode: 404, statusMessage: 'Vehicle not found' })
  }

  const parts = await readMultipartFormData(event)
  const files = (parts ?? []).filter(
    (p) => p.name === 'photos' && p.data?.length,
  )
  if (!files.length) {
    throw createError({ statusCode: 400, statusMessage: 'No files uploaded' })
  }

  const [{ maxSort }] = await db
    .select({ maxSort: max(schema.vehiclePhotos.sortOrder) })
    .from(schema.vehiclePhotos)
    .where(eq(schema.vehiclePhotos.vehicleId, vehicleId))
  const existingCount = await db.$count(
    schema.vehiclePhotos,
    eq(schema.vehiclePhotos.vehicleId, vehicleId),
  )

  let sortOrder = (maxSort ?? -1) + 1
  const created = []
  for (const file of files) {
    if (file.data.length > MAX_FILE_SIZE) {
      throw createError({ statusCode: 413, statusMessage: 'File too large (max 15 MB)' })
    }
    let stored
    try {
      stored = await storeVehicleImage(Buffer.from(file.data), vehicleId)
    } catch {
      throw createError({ statusCode: 400, statusMessage: 'Invalid image file' })
    }
    const [photo] = await db
      .insert(schema.vehiclePhotos)
      .values({
        vehicleId,
        url: stored.url,
        thumbnailUrl: stored.thumbnailUrl,
        sortOrder: sortOrder++,
        isPrimary: existingCount === 0 && created.length === 0,
      })
      .returning()
    created.push(photo)
  }

  return created
})
