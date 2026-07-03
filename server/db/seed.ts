/**
 * Seed the database with lookup data and sample vehicles.
 * Run with: pnpm db:seed
 * Idempotent-ish: skips seeding vehicles if any already exist.
 */
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { generateProductCode, generateVehicleSlug } from '../utils/vehicle-codes'
import * as schema from './schema'

const client = postgres(
  process.env.DATABASE_URL ??
    'postgres://swisscars:swisscars@localhost:5432/swisscars',
  { max: 1 },
)
const db = drizzle(client, { schema })

const MAKES = [
  { name: 'BMW', models: ['X5', 'X3', '3 Series', '5 Series'] },
  { name: 'Mercedes-Benz', models: ['GLC', 'E-Class', 'C-Class'] },
  { name: 'Audi', models: ['Q5', 'A4', 'A6'] },
  { name: 'Volkswagen', models: ['Tiguan', 'Passat', 'Golf'] },
  { name: 'Toyota', models: ['RAV4', 'Corolla', 'Land Cruiser'] },
  { name: 'Skoda', models: ['Octavia', 'Kodiaq', 'Superb'] },
]

const FEATURES = [
  'climate_control',
  'leather_seats',
  'navigation',
  'parking_sensors',
  'led_lights',
  'panoramic_roof',
  'heated_seats',
  'rear_camera',
  'cruise_control',
  'keyless_entry',
]

// Free-to-use Unsplash placeholders until real photos are uploaded to R2
const PLACEHOLDER = (seed: string) =>
  `https://images.unsplash.com/${seed}?w=1200&q=80&fm=webp`
const PLACEHOLDER_THUMB = (seed: string) =>
  `https://images.unsplash.com/${seed}?w=480&q=70&fm=webp`

async function main() {
  console.log('Seeding lookup tables…')

  for (const [i, make] of MAKES.entries()) {
    const [m] = await db
      .insert(schema.makes)
      .values({
        name: make.name,
        slug: make.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sortOrder: i,
      })
      .onConflictDoNothing()
      .returning()
    const makeId =
      m?.id ??
      (
        await db.query.makes.findFirst({
          where: (t, { eq }) => eq(t.name, make.name),
        })
      )!.id
    for (const model of make.models) {
      await db
        .insert(schema.models)
        .values({
          makeId,
          name: model,
          slug: model.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        })
        .onConflictDoNothing()
    }
  }

  for (const [i, code] of FEATURES.entries()) {
    await db
      .insert(schema.features)
      .values({ code, sortOrder: i })
      .onConflictDoNothing()
  }

  const existing = await db.query.vehicles.findFirst()
  if (existing) {
    console.log('Vehicles already seeded — skipping.')
    await client.end()
    return
  }

  console.log('Seeding sellers…')
  const [seller1, seller2] = await db
    .insert(schema.sellers)
    .values([
      {
        name: 'Ion Munteanu',
        phone: '+373 60 000 001',
        whatsapp: '+373 60 000 001',
        role: 'Senior Sales',
        sortOrder: 0,
      },
      {
        name: 'Andrei Rusu',
        phone: '+373 60 000 002',
        whatsapp: '+373 60 000 002',
        role: 'Sales Manager',
        sortOrder: 1,
      },
    ])
    .returning()

  console.log('Seeding vehicles…')

  const allMakes = await db.query.makes.findMany({ with: {} })
  const allModels = await db.query.models.findMany()
  const findIds = (makeName: string, modelName: string) => {
    const make = allMakes.find((m) => m.name === makeName)!
    const model = allModels.find(
      (m) => m.makeId === make.id && m.name === modelName,
    )!
    return { makeId: make.id, modelId: model.id }
  }

  type SeedVehicle = Omit<
    typeof schema.vehicles.$inferInsert,
    'slug' | 'productCode' | 'makeId' | 'modelId'
  > & { makeName: string; modelName: string; photoSeeds: string[] }

  const samples: SeedVehicle[] = [
    {
      makeName: 'BMW',
      modelName: 'X5',
      year: 2019,
      price: 38500,
      priceType: 'fixed',
      status: 'in_stock',
      mileageKm: 89000,
      fuelType: 'diesel',
      transmission: 'automatic',
      drivetrain: 'awd',
      bodyType: 'suv',
      powerHp: 265,
      engineCc: 2993,
      color: 'Black Sapphire',
      isFeatured: true,
      assignedSellerId: seller1.id,
      description:
        'BMW X5 xDrive30d importat din Elveția. Istoric complet de service, un singur proprietar, stare impecabilă.',
      photoSeeds: ['photo-1555215695-3004980ad54e', 'photo-1556189250-72ba954cfc2b'],
    },
    {
      makeName: 'Mercedes-Benz',
      modelName: 'GLC',
      year: 2020,
      price: 36900,
      priceType: 'fixed',
      status: 'in_stock',
      mileageKm: 64000,
      fuelType: 'diesel',
      transmission: 'automatic',
      drivetrain: 'awd',
      bodyType: 'suv',
      powerHp: 194,
      engineCc: 1950,
      color: 'Selenite Grey',
      isFeatured: true,
      assignedSellerId: seller2.id,
      description:
        'Mercedes-Benz GLC 220d 4MATIC. Verificat tehnic în Elveția, fără accidente.',
      photoSeeds: ['photo-1618843479313-40f8afb4b4d8'],
    },
    {
      makeName: 'Volkswagen',
      modelName: 'Tiguan',
      year: 2018,
      price: 19800,
      priceType: 'fixed',
      status: 'reserved',
      mileageKm: 112000,
      fuelType: 'petrol',
      transmission: 'automatic',
      drivetrain: 'fwd',
      bodyType: 'crossover',
      powerHp: 150,
      engineCc: 1395,
      color: 'Pure White',
      assignedSellerId: seller2.id,
      description: 'VW Tiguan 1.4 TSI DSG, dotări bogate, întreținut la reprezentanță.',
      photoSeeds: ['photo-1606664515524-ed2f786a0bd6'],
    },
    {
      makeName: 'Skoda',
      modelName: 'Octavia',
      year: 2021,
      price: 17500,
      priceType: 'estimated',
      status: 'on_order',
      mileageKm: 45000,
      fuelType: 'diesel',
      transmission: 'automatic',
      drivetrain: 'fwd',
      bodyType: 'wagon',
      powerHp: 150,
      engineCc: 1968,
      estimatedDeliveryDays: 21,
      description:
        'Skoda Octavia Combi 2.0 TDI DSG — model de referință. Găsim exemplarul potrivit în Elveția în ~3 săptămâni.',
      photoSeeds: ['photo-1549317661-bd32c8ce0db2'],
    },
    {
      makeName: 'Toyota',
      modelName: 'RAV4',
      year: 2022,
      price: 29900,
      priceType: 'estimated',
      status: 'on_order',
      mileageKm: 30000,
      fuelType: 'hybrid',
      transmission: 'automatic',
      drivetrain: 'awd',
      bodyType: 'suv',
      powerHp: 218,
      engineCc: 2487,
      estimatedDeliveryDays: 30,
      isFeatured: true,
      description:
        'Toyota RAV4 Hybrid AWD — la comandă din Elveția. Preț estimativ cu transport și acte incluse.',
      photoSeeds: ['photo-1581540222194-0def2dda95b8'],
    },
    {
      makeName: 'Audi',
      modelName: 'A4',
      year: 2017,
      price: 15900,
      priceType: 'fixed',
      status: 'sold',
      mileageKm: 134000,
      fuelType: 'diesel',
      transmission: 'automatic',
      drivetrain: 'fwd',
      bodyType: 'sedan',
      powerHp: 150,
      engineCc: 1968,
      color: 'Glacier White',
      description: 'Audi A4 2.0 TDI S-tronic — vândut.',
      photoSeeds: ['photo-1541899481282-d53bffe3c35d'],
    },
  ]

  const featureRows = await db.query.features.findMany()

  for (const s of samples) {
    const { makeName, modelName, photoSeeds, ...rest } = s
    const ids = findIds(makeName, modelName)
    const [v] = await db
      .insert(schema.vehicles)
      .values({
        ...rest,
        ...ids,
        slug: generateVehicleSlug(makeName, modelName, s.year),
        productCode: generateProductCode(),
      })
      .returning()

    await db.insert(schema.vehiclePhotos).values(
      photoSeeds.map((seed, i) => ({
        vehicleId: v.id,
        url: PLACEHOLDER(seed),
        thumbnailUrl: PLACEHOLDER_THUMB(seed),
        sortOrder: i,
        isPrimary: i === 0,
      })),
    )

    // Attach 4–6 features per vehicle
    const picked = featureRows.slice(0, 4 + Math.floor(Math.random() * 3))
    await db.insert(schema.vehicleFeatureMap).values(
      picked.map((f) => ({ vehicleId: v.id, featureId: f.id })),
    )
  }

  console.log('Seeding testimonials…')
  await db.insert(schema.testimonials).values([
    {
      authorName: 'Vasile C.',
      text: 'Am comandat un BMW din Elveția — totul transparent, livrat în 3 săptămâni exact cum a fost promis.',
      rating: 5,
      sortOrder: 0,
    },
    {
      authorName: 'Elena P.',
      text: 'Mașina din stoc era exact ca în poze. Recomand cu încredere!',
      rating: 5,
      sortOrder: 1,
    },
  ])

  console.log('Seeding default settings…')
  await db
    .insert(schema.settings)
    .values([
      { key: 'company', value: { name: 'Swiss Cars', address: '', phones: [], email: '', workingHours: '', socials: {} } },
      { key: 'leasing_partners', value: [] },
      { key: 'financing_calculator', value: { annualInterestRate: 9.5, minTermMonths: 12, maxTermMonths: 72, minDownPaymentPct: 20 } },
      { key: 'seo_defaults', value: { titleTemplate: '%s · Swiss Cars', description: 'Mașini importate din Elveția — în stoc și la comandă.' } },
      { key: 'analytics', value: { gtagId: '', metaPixelId: '' } },
    ])
    .onConflictDoNothing()

  console.log('Done.')
  await client.end()
}

main().catch(async (err) => {
  console.error(err)
  await client.end()
  process.exit(1)
})
