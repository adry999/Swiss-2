import { relations } from 'drizzle-orm'
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

// ── Enums ────────────────────────────────────────────────────────────────

export const vehicleStatus = pgEnum('vehicle_status', [
  'in_stock',
  'on_order',
  'reserved',
  'sold',
])

export const priceType = pgEnum('price_type', ['fixed', 'estimated'])

export const fuelType = pgEnum('fuel_type', [
  'petrol',
  'diesel',
  'hybrid',
  'plugin_hybrid',
  'electric',
  'lpg',
])

export const transmission = pgEnum('transmission', ['manual', 'automatic'])

export const drivetrain = pgEnum('drivetrain', ['fwd', 'rwd', 'awd'])

export const bodyType = pgEnum('body_type', [
  'sedan',
  'hatchback',
  'wagon',
  'suv',
  'crossover',
  'coupe',
  'cabriolet',
  'minivan',
  'pickup',
  'van',
])

export const leadType = pgEnum('lead_type', [
  'order_request',
  'contact',
  'financing',
  'callback',
])

export const leadStatus = pgEnum('lead_status', ['new', 'contacted', 'closed'])

export const userRole = pgEnum('user_role', ['admin', 'sales_manager'])

// ── Lookup tables ────────────────────────────────────────────────────────

export const makes = pgTable('makes', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 64 }).notNull().unique(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const models = pgTable(
  'models',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    makeId: integer('make_id')
      .notNull()
      .references(() => makes.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 64 }).notNull(),
    slug: varchar('slug', { length: 64 }).notNull(),
  },
  (t) => [unique().on(t.makeId, t.slug)],
)

export const features = pgTable('features', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  // i18n keys resolved on the frontend, e.g. 'features.climate_control'
  code: varchar('code', { length: 64 }).notNull().unique(),
  sortOrder: integer('sort_order').notNull().default(0),
})

// ── Sellers ──────────────────────────────────────────────────────────────

export const sellers = pgTable('sellers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 128 }).notNull(),
  phone: varchar('phone', { length: 32 }).notNull(),
  whatsapp: varchar('whatsapp', { length: 32 }),
  viber: varchar('viber', { length: 32 }),
  photoUrl: text('photo_url'),
  role: varchar('role', { length: 64 }),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
})

// ── Vehicles ─────────────────────────────────────────────────────────────

export const vehicles = pgTable('vehicles', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  makeId: integer('make_id')
    .notNull()
    .references(() => makes.id),
  modelId: integer('model_id')
    .notNull()
    .references(() => models.id),
  year: integer('year').notNull(),
  // stored in whole EUR; null only for pure on-order references without an estimate
  price: integer('price'),
  priceType: priceType('price_type').notNull().default('fixed'),
  currency: varchar('currency', { length: 3 }).notNull().default('EUR'),
  status: vehicleStatus('status').notNull().default('in_stock'),
  mileageKm: integer('mileage_km'),
  fuelType: fuelType('fuel_type').notNull(),
  transmission: transmission('transmission').notNull(),
  drivetrain: drivetrain('drivetrain'),
  bodyType: bodyType('body_type'),
  powerHp: integer('power_hp'),
  engineCc: integer('engine_cc'),
  color: varchar('color', { length: 64 }),
  originCountry: varchar('origin_country', { length: 64 })
    .notNull()
    .default('Switzerland'),
  vin: varchar('vin', { length: 17 }),
  productCode: varchar('product_code', { length: 16 }).notNull().unique(),
  description: text('description'),
  estimatedDeliveryDays: integer('estimated_delivery_days'),
  viewsCount: integer('views_count').notNull().default(0),
  isFeatured: boolean('is_featured').notNull().default(false),
  assignedSellerId: uuid('assigned_seller_id').references(() => sellers.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const vehiclePhotos = pgTable('vehicle_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  vehicleId: uuid('vehicle_id')
    .notNull()
    .references(() => vehicles.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  sortOrder: integer('sort_order').notNull().default(0),
  isPrimary: boolean('is_primary').notNull().default(false),
})

export const vehicleFeatureMap = pgTable(
  'vehicle_feature_map',
  {
    vehicleId: uuid('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    featureId: integer('feature_id')
      .notNull()
      .references(() => features.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.vehicleId, t.featureId] })],
)

// ── Leads ────────────────────────────────────────────────────────────────

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: leadType('type').notNull(),
  vehicleId: uuid('vehicle_id').references(() => vehicles.id, {
    onDelete: 'set null',
  }),
  name: varchar('name', { length: 128 }).notNull(),
  phone: varchar('phone', { length: 32 }).notNull(),
  email: varchar('email', { length: 128 }),
  message: text('message'),
  budget: integer('budget'),
  referenceLinks: text('reference_links'),
  status: leadStatus('status').notNull().default('new'),
  assignedSellerId: uuid('assigned_seller_id').references(() => sellers.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// ── Testimonials ─────────────────────────────────────────────────────────

export const testimonials = pgTable('testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorName: varchar('author_name', { length: 128 }).notNull(),
  text: text('text').notNull(),
  rating: integer('rating').notNull().default(5),
  isVisible: boolean('is_visible').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// ── Settings (key-value, JSON values) ────────────────────────────────────

export const settings = pgTable('settings', {
  key: varchar('key', { length: 64 }).primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

// ── Admin users ──────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 128 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 128 }).notNull(),
  role: userRole('role').notNull().default('sales_manager'),
  // sales managers can be linked to a seller profile for "own assignments"
  sellerId: uuid('seller_id').references(() => sellers.id, {
    onDelete: 'set null',
  }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// ── Relations ────────────────────────────────────────────────────────────

export const makesRelations = relations(makes, ({ many }) => ({
  models: many(models),
  vehicles: many(vehicles),
}))

export const modelsRelations = relations(models, ({ one, many }) => ({
  make: one(makes, { fields: [models.makeId], references: [makes.id] }),
  vehicles: many(vehicles),
}))

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  make: one(makes, { fields: [vehicles.makeId], references: [makes.id] }),
  model: one(models, { fields: [vehicles.modelId], references: [models.id] }),
  photos: many(vehiclePhotos),
  featureMap: many(vehicleFeatureMap),
  assignedSeller: one(sellers, {
    fields: [vehicles.assignedSellerId],
    references: [sellers.id],
  }),
  leads: many(leads),
}))

export const vehiclePhotosRelations = relations(vehiclePhotos, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehiclePhotos.vehicleId],
    references: [vehicles.id],
  }),
}))

export const featuresRelations = relations(features, ({ many }) => ({
  vehicleMap: many(vehicleFeatureMap),
}))

export const vehicleFeatureMapRelations = relations(
  vehicleFeatureMap,
  ({ one }) => ({
    vehicle: one(vehicles, {
      fields: [vehicleFeatureMap.vehicleId],
      references: [vehicles.id],
    }),
    feature: one(features, {
      fields: [vehicleFeatureMap.featureId],
      references: [features.id],
    }),
  }),
)

export const sellersRelations = relations(sellers, ({ many }) => ({
  vehicles: many(vehicles),
  leads: many(leads),
}))

export const leadsRelations = relations(leads, ({ one }) => ({
  vehicle: one(vehicles, { fields: [leads.vehicleId], references: [vehicles.id] }),
  assignedSeller: one(sellers, {
    fields: [leads.assignedSellerId],
    references: [sellers.id],
  }),
}))

export const usersRelations = relations(users, ({ one }) => ({
  seller: one(sellers, { fields: [users.sellerId], references: [sellers.id] }),
}))
