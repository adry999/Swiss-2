import { db } from '../db'

export default defineEventHandler(async () => {
  return db.query.testimonials.findMany({
    where: (t, { eq }) => eq(t.isVisible, true),
    orderBy: (t, { asc, desc }) => [asc(t.sortOrder), desc(t.createdAt)],
    columns: { id: true, authorName: true, text: true, rating: true },
  })
})
