import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { join, normalize, sep } from 'node:path'
import { UPLOADS_DIR } from '../../utils/storage'

export default defineEventHandler(async (event) => {
  const rawPath = getRouterParam(event, 'path') ?? ''
  const safe = normalize(decodeURIComponent(rawPath))
  const filePath = join(UPLOADS_DIR, safe)

  if (!filePath.startsWith(UPLOADS_DIR + sep)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  try {
    const info = await stat(filePath)
    if (!info.isFile()) throw new Error('not a file')
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  setHeader(event, 'Content-Type', 'image/webp')
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  return sendStream(event, createReadStream(filePath))
})
