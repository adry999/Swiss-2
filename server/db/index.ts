import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString =
  process.env.DATABASE_URL ??
  'postgres://swisscars:swisscars@localhost:5432/swisscars'

// Single connection pool for the Nitro server process
const client = postgres(connectionString, { max: 10 })

export const db = drizzle(client, { schema })

export type Db = typeof db
export { schema }
