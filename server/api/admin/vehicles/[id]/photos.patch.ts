import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '../../../../db'
import { requireRole } from '../../../../utils/admin-auth'

const bodySchema = z.object({
  order: z.array(z.string().uuid()).min(1),
  primaryId: z.string().uuid().optional(),
})

export default defineEventHandler(async (event) => {
  await requireRole(event)
  const vehicleId = getRouterParam(event, 'id')!

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request' })
  }
  const { order, primaryId } = parsed.data

  await db.transaction(async (tx) => {
    for (const [index, photoId] of order.entries()) {
      await tx
        .update(schema.vehiclePhotos)
        .set({
          sortOrder: index,
          ...(primaryId ? { isPrimary: photoId === primaryId } : {}),
        })
        .where(
          and(
            eq(schema.vehiclePhotos.id, photoId),
            eq(schema.vehiclePhotos.vehicleId, vehicleId),
          ),
        )
    }
  })

  return { ok: true }
})
