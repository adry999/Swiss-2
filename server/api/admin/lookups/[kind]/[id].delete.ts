import { eq } from 'drizzle-orm'
import { db, schema } from '../../../../db'
import { requireRole } from '../../../../utils/admin-auth'

const tables = {
  makes: schema.makes,
  models: schema.models,
  features: schema.features,
} as const

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])
  const kind = getRouterParam(event, 'kind') as keyof typeof tables
  const id = Number(getRouterParam(event, 'id'))

  const table = tables[kind]
  if (!table || !Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid lookup kind or id' })
  }

  try {
    const [deleted] = await db
      .delete(table)
      .where(eq(table.id, id))
      .returning({ id: table.id })
    if (!deleted) {
      throw createError({ statusCode: 404, statusMessage: 'Not found' })
    }
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err) throw err
    // FK violation: lookup still referenced by vehicles
    throw createError({
      statusCode: 409,
      statusMessage: 'Nu poate fi șters: este folosit de vehicule existente',
    })
  }

  return { ok: true }
})
