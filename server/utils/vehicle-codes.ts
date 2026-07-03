import { customAlphabet } from 'nanoid'

// Unambiguous alphabet (no 0/O, 1/I/L) for short public identifiers
const shortId = customAlphabet('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 6)

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** SEO slug: bmw-x5-2019-a3f9kq */
export function generateVehicleSlug(make: string, model: string, year: number): string {
  return `${slugify(`${make} ${model} ${year}`)}-${shortId().toLowerCase()}`
}

/** Display code shown to clients, e.g. SC-A3F9KQ */
export function generateProductCode(): string {
  return `SC-${shortId()}`
}
