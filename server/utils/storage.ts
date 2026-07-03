import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { customAlphabet } from 'nanoid'
import sharp from 'sharp'

const fileId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12)

export const UPLOADS_DIR = join(process.cwd(), '.data', 'uploads')

export interface StoredImage {
  url: string
  thumbnailUrl: string
}

interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  publicBaseUrl: string
}

function getR2Config(): R2Config | null {
  const config = useRuntimeConfig()
  if (!config.r2AccountId || !config.r2AccessKeyId || !config.r2SecretAccessKey) {
    return null
  }
  return {
    accountId: config.r2AccountId,
    accessKeyId: config.r2AccessKeyId,
    secretAccessKey: config.r2SecretAccessKey,
    bucket: config.r2Bucket,
    publicBaseUrl: config.public.imageBaseUrl,
  }
}

let s3Client: S3Client | null = null

function getS3(r2: R2Config): S3Client {
  s3Client ??= new S3Client({
    region: 'auto',
    endpoint: `https://${r2.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2.accessKeyId,
      secretAccessKey: r2.secretAccessKey,
    },
  })
  return s3Client
}

/**
 * Process an uploaded image (webp main + thumbnail) and store it.
 * Uses Cloudflare R2 when configured, local disk (.data/uploads) otherwise.
 */
export async function storeVehicleImage(
  buffer: Buffer,
  vehicleId: string,
): Promise<StoredImage> {
  const id = fileId()
  const mainKey = `vehicles/${vehicleId}/${id}.webp`
  const thumbKey = `vehicles/${vehicleId}/${id}_thumb.webp`

  const main = await sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()
  const thumb = await sharp(buffer)
    .rotate()
    .resize({ width: 480, withoutEnlargement: true })
    .webp({ quality: 70 })
    .toBuffer()

  const r2 = getR2Config()
  if (r2) {
    const s3 = getS3(r2)
    await Promise.all([
      s3.send(
        new PutObjectCommand({
          Bucket: r2.bucket,
          Key: mainKey,
          Body: main,
          ContentType: 'image/webp',
        }),
      ),
      s3.send(
        new PutObjectCommand({
          Bucket: r2.bucket,
          Key: thumbKey,
          Body: thumb,
          ContentType: 'image/webp',
        }),
      ),
    ])
    const base = r2.publicBaseUrl.replace(/\/$/, '')
    return { url: `${base}/${mainKey}`, thumbnailUrl: `${base}/${thumbKey}` }
  }

  const mainPath = join(UPLOADS_DIR, mainKey)
  await mkdir(dirname(mainPath), { recursive: true })
  await Promise.all([
    writeFile(mainPath, main),
    writeFile(join(UPLOADS_DIR, thumbKey), thumb),
  ])
  return { url: `/uploads/${mainKey}`, thumbnailUrl: `/uploads/${thumbKey}` }
}

/** Delete a stored image by its public URL (main or thumbnail). */
export async function deleteStoredImage(url: string): Promise<void> {
  try {
    const r2 = getR2Config()
    if (r2 && r2.publicBaseUrl && url.startsWith(r2.publicBaseUrl)) {
      const key = url
        .slice(r2.publicBaseUrl.length)
        .replace(/^\//, '')
      await getS3(r2).send(
        new DeleteObjectCommand({ Bucket: r2.bucket, Key: key }),
      )
      return
    }
    if (url.startsWith('/uploads/')) {
      const key = url.slice('/uploads/'.length)
      await rm(join(UPLOADS_DIR, key), { force: true })
    }
    // External URLs (e.g. seed placeholders) — nothing to delete
  } catch (err) {
    // Deleting a missing file must not block removing the DB row
    console.error('deleteStoredImage failed:', err)
  }
}
