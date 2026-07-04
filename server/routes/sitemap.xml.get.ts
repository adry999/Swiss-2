import { db } from '../db'

const STATIC_PATHS = [
  '',
  '/stoc',
  '/comanda',
  '/leasing',
  '/despre',
  '/recenzii',
  '/contact',
]
const LOCALE_PREFIXES = ['', '/ru', '/en']

export default defineEventHandler(async (event) => {
  const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')

  const vehicles = await db.query.vehicles.findMany({
    where: (t, { inArray }) =>
      inArray(t.status, ['in_stock', 'on_order', 'reserved']),
    columns: { slug: true, updatedAt: true },
  })

  const urls: string[] = []
  for (const prefix of LOCALE_PREFIXES) {
    for (const path of STATIC_PATHS) {
      urls.push(`<url><loc>${siteUrl}${prefix}${path}</loc></url>`)
    }
    for (const v of vehicles) {
      urls.push(
        `<url><loc>${siteUrl}${prefix}/vehicul/${v.slug}</loc><lastmod>${v.updatedAt.toISOString().slice(0, 10)}</lastmod></url>`,
      )
    }
  }

  setHeader(event, 'Content-Type', 'application/xml')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`
})
