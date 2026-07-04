import { db } from '../db'

// Public lookups for catalog filters and forms
export default defineEventHandler(async () => {
  const makes = await db.query.makes.findMany({
    orderBy: (t, { asc }) => [asc(t.sortOrder), asc(t.name)],
    with: { models: { orderBy: (t, { asc }) => [asc(t.name)] } },
  })
  return { makes }
})
