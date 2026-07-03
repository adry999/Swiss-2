import { db } from '../db'

// Public team list (active sellers only, no internal fields)
export default defineEventHandler(async () => {
  return db.query.sellers.findMany({
    where: (t, { eq }) => eq(t.isActive, true),
    orderBy: (t, { asc }) => [asc(t.sortOrder), asc(t.name)],
    columns: {
      id: true,
      name: true,
      phone: true,
      whatsapp: true,
      viber: true,
      photoUrl: true,
      role: true,
    },
  })
})
