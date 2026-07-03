import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '../../../db'
import { requireRole } from '../../../utils/admin-auth'

const KNOWN_KEYS = [
  'company',
  'leasing_partners',
  'financing_calculator',
  'seo_defaults',
  'analytics',
] as const

const bodySchema = z.record(z.enum(KNOWN_KEYS), z.unknown())

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid settings payload' })
  }

  const entries = Object.entries(parsed.data).filter(([, v]) => v !== undefined)
  if (!entries.length) {
    throw createError({ statusCode: 400, statusMessage: 'Empty settings payload' })
  }

  await db
    .insert(schema.settings)
    .values(entries.map(([key, value]) => ({ key, value })))
    .onConflictDoUpdate({
      target: schema.settings.key,
      set: { value: sql`excluded.value` },
    })

  return { ok: true }
})
