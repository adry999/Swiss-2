import { z } from 'zod'
import { db, schema } from '../../../db'
import { requireRole } from '../../../utils/admin-auth'
import { slugify } from '../../../utils/vehicle-codes'

const bodySchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('make'), name: z.string().min(1).max(64) }),
  z.object({
    kind: z.literal('model'),
    makeId: z.number().int().positive(),
    name: z.string().min(1).max(64),
  }),
  z.object({ kind: z.literal('feature'), code: z.string().min(1).max(64) }),
])

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin'])

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Validation failed' })
  }
  const input = parsed.data

  if (input.kind === 'make') {
    const [row] = await db
      .insert(schema.makes)
      .values({ name: input.name, slug: slugify(input.name) })
      .onConflictDoNothing()
      .returning()
    if (!row) throw createError({ statusCode: 409, statusMessage: 'Make already exists' })
    return row
  }

  if (input.kind === 'model') {
    const [row] = await db
      .insert(schema.models)
      .values({
        makeId: input.makeId,
        name: input.name,
        slug: slugify(input.name),
      })
      .onConflictDoNothing()
      .returning()
    if (!row) throw createError({ statusCode: 409, statusMessage: 'Model already exists' })
    return row
  }

  const [row] = await db
    .insert(schema.features)
    .values({ code: slugify(input.code).replace(/-/g, '_') })
    .onConflictDoNothing()
    .returning()
  if (!row) throw createError({ statusCode: 409, statusMessage: 'Feature already exists' })
  return row
})
