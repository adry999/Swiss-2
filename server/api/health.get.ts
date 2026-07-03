import { sql } from 'drizzle-orm'
import { db } from '../db'

export default defineEventHandler(async (event) => {
  try {
    await db.execute(sql`select 1`)
    return { status: 'ok', db: 'up' }
  } catch {
    setResponseStatus(event, 503)
    return { status: 'degraded', db: 'down' }
  }
})
