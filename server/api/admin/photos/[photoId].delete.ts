import { eq } from 'drizzle-orm'
import { db, schema } from '../../../db'
import { requireRole } from '../../../utils/admin-auth'
import { deleteStoredImage } from '../../../utils/storage'

export default defineEventHandler(async (event) => {
  await requireRole(event)
  const photoId = getRouterParam(event, 'photoId')!

  const [photo] = await db
    .delete(schema.vehiclePhotos)
    .where(eq(schema.vehiclePhotos.id, photoId))
    .returning()
  if (!photo) {
    throw createError({ statusCode: 404, statusMessage: 'Photo not found' })
  }

  await deleteStoredImage(photo.url)
  if (photo.thumbnailUrl) await deleteStoredImage(photo.thumbnailUrl)

  // Keep an is_primary photo around if the primary one was removed
  if (photo.isPrimary) {
    const next = await db.query.vehiclePhotos.findFirst({
      where: (t, { eq }) => eq(t.vehicleId, photo.vehicleId),
      orderBy: (t, { asc }) => [asc(t.sortOrder)],
    })
    if (next) {
      await db
        .update(schema.vehiclePhotos)
        .set({ isPrimary: true })
        .where(eq(schema.vehiclePhotos.id, next.id))
    }
  }

  return { ok: true }
})
