import { z } from 'zod'

export const vehicleInputSchema = z.object({
  makeId: z.number().int().positive(),
  modelId: z.number().int().positive(),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1),
  price: z.number().int().positive().nullable(),
  priceType: z.enum(['fixed', 'estimated']),
  status: z.enum(['in_stock', 'on_order', 'reserved', 'sold']),
  mileageKm: z.number().int().min(0).nullable(),
  fuelType: z.enum(['petrol', 'diesel', 'hybrid', 'plugin_hybrid', 'electric', 'lpg']),
  transmission: z.enum(['manual', 'automatic']),
  drivetrain: z.enum(['fwd', 'rwd', 'awd']).nullable(),
  bodyType: z
    .enum([
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
    .nullable(),
  powerHp: z.number().int().positive().nullable(),
  engineCc: z.number().int().positive().nullable(),
  color: z.string().max(64).nullable(),
  originCountry: z.string().max(64).default('Switzerland'),
  vin: z.string().max(17).nullable(),
  description: z.string().nullable(),
  estimatedDeliveryDays: z.number().int().positive().nullable(),
  isFeatured: z.boolean().default(false),
  assignedSellerId: z.string().uuid().nullable(),
  featureIds: z.array(z.number().int()).default([]),
})

export type VehicleInput = z.infer<typeof vehicleInputSchema>
