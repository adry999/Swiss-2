import { db } from '../db'

// Public subset of settings (company contacts, financing params, leasing partners)
export default defineEventHandler(async () => {
  const rows = await db.query.settings.findMany()
  const all = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return {
    company: all.company ?? {},
    financing: all.financing_calculator ?? {},
    leasingPartners: all.leasing_partners ?? [],
    analytics: all.analytics ?? {},
  }
})
