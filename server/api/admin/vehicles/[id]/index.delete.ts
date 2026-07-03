import { eq } from 'drizzle-orm'
import { db, schema } from '../../../../db'
import { requireRole } from '../../../../utils/admin-auth'
import { deleteStoredImage } from '../../../../utils/storage'

export default defineEventHandler(async (event) => {
  await requireRole(event)
  const id = getRouterParam(event, 'id')!

  const photos = await db.query.vehiclePhotos.findMany({
    where: (t, { eq }) => eq(t.vehicleId, id),
  })

  const [deleted] = await db
    .delete(schema.vehicles)
    .where(eq(schema.vehicles.id, id))
    .returning({ id: schema.vehicles.id })
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Vehicle not found' })
  }

  // Photo rows cascade with the vehicle; clean up stored files best-effort
  for (const photo of photos) {
    await deleteStoredImage(photo.url)
    if (photo.thumbnailUrl) await deleteStoredImage(photo.thumbnailUrl)
  }

  return { ok: true }
})
