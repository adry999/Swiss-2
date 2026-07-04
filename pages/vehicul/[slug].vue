<script setup lang="ts">
const { t, locale } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()

const { data: vehicle, error } = await useFetch(
  `/api/vehicles/${route.params.slug}`,
)
if (error.value || !vehicle.value) {
  throw createError({ statusCode: 404, statusMessage: 'Vehicle not found', fatal: true })
}

const { data: site } = await useFetch('/api/site-settings')

const v = vehicle.value
const title = `${v.make.name} ${v.model.name} ${v.year}`

const priceLabel = computed(() => {
  if (v.price == null) return t('vehicle.price_estimated')
  const formatted = `€${v.price.toLocaleString('ro-RO')}`
  return v.priceType === 'estimated' ? `~${formatted}` : formatted
})

// Simple annuity estimate from financing settings
const monthlyRate = computed(() => {
  const f = site.value?.financing as
    | { annualInterestRate?: number; maxTermMonths?: number; minDownPaymentPct?: number }
    | undefined
  if (!v.price || !f?.annualInterestRate || !f.maxTermMonths) return null
  const principal = v.price * (1 - (f.minDownPaymentPct ?? 20) / 100)
  const i = f.annualInterestRate / 100 / 12
  const n = f.maxTermMonths
  const rate = (principal * i) / (1 - (1 + i) ** -n)
  return Math.round(rate)
})

const specs = computed(() =>
  [
    [t('vehicle.year'), String(v.year)],
    [t('vehicle.mileage'), v.mileageKm != null ? `${v.mileageKm.toLocaleString('ro-RO')} km` : null],
    [t('vehicle.fuel'), t(`fuel.${v.fuelType}`)],
    [t('vehicle.transmission'), t(`transmission_types.${v.transmission}`)],
    [t('vehicle.drivetrain'), v.drivetrain ? t(`drivetrain_types.${v.drivetrain}`) : null],
    [t('vehicle.body'), v.bodyType ? t(`body_types.${v.bodyType}`) : null],
    [t('vehicle.power'), v.powerHp ? `${v.powerHp} CP` : null],
    [t('vehicle.engine'), v.engineCc ? `${v.engineCc} cm³` : null],
    [t('vehicle.color'), v.color],
    [t('vehicle.origin'), v.originCountry],
    ['VIN', v.status === 'in_stock' ? v.vin : null],
    [t('vehicle.code'), v.productCode],
  ].filter(([, value]) => value) as [string, string][],
)

const primaryPhoto = v.photos.find((p) => p.isPrimary) ?? v.photos[0]

useHead({ title })
useSeoMeta({
  description: `${title} — ${priceLabel.value}. ${v.description?.slice(0, 150) ?? t('catalog.subtitle')}`,
  ogTitle: title,
  ogDescription: v.description?.slice(0, 200) ?? t('catalog.subtitle'),
  ogImage: primaryPhoto
    ? primaryPhoto.url.startsWith('http')
      ? primaryPhoto.url
      : `${config.public.siteUrl}${primaryPhoto.url}`
    : undefined,
  ogType: 'website',
})

// schema.org Vehicle + Offer structured data
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Vehicle',
        name: title,
        brand: { '@type': 'Brand', name: v.make.name },
        model: v.model.name,
        vehicleModelDate: String(v.year),
        mileageFromOdometer:
          v.mileageKm != null
            ? { '@type': 'QuantitativeValue', value: v.mileageKm, unitCode: 'KMT' }
            : undefined,
        fuelType: v.fuelType,
        vehicleTransmission: v.transmission,
        color: v.color ?? undefined,
        vehicleIdentificationNumber: v.vin ?? undefined,
        image: v.photos.map((p) =>
          p.url.startsWith('http') ? p.url : `${config.public.siteUrl}${p.url}`,
        ),
        offers: v.price
          ? {
              '@type': 'Offer',
              price: v.price,
              priceCurrency: v.currency,
              availability:
                v.status === 'in_stock'
                  ? 'https://schema.org/InStock'
                  : v.status === 'on_order'
                    ? 'https://schema.org/PreOrder'
                    : 'https://schema.org/SoldOut',
            }
          : undefined,
      }),
    },
  ],
})

const badgeClass = {
  in_stock: 'badge-in-stock',
  on_order: 'badge-on-order',
  reserved: 'badge-reserved',
  sold: 'badge-sold',
}[v.status]

const showCallback = ref(false)
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-6 lg:py-10">
    <div class="grid gap-8 lg:grid-cols-5">
      <!-- Gallery -->
      <div class="lg:col-span-3">
        <VehicleGallery :photos="v.photos" :alt="title" />
      </div>

      <!-- Summary / CTA column -->
      <div class="lg:col-span-2">
        <span :class="badgeClass">
          {{ v.status === 'on_order' ? t('detail.delivery_badge') : t(`status.${v.status}`) }}
        </span>
        <h1 class="mt-3 text-2xl font-extrabold sm:text-3xl">{{ title }}</h1>

        <p class="mt-4 text-3xl font-extrabold text-primary">{{ priceLabel }}</p>
        <p v-if="v.priceType === 'estimated'" class="mt-1 text-sm text-neutral-500">
          {{ t('detail.est_price_note') }}
        </p>
        <p v-if="v.status === 'in_stock' && monthlyRate" class="mt-1 text-sm text-neutral-500">
          {{ t('detail.monthly_from', { rate: `€${monthlyRate}` }) }}
        </p>
        <p v-if="v.status === 'on_order' && v.estimatedDeliveryDays" class="mt-2 font-medium">
          🚚 {{ t('detail.est_delivery', { days: v.estimatedDeliveryDays }) }}
        </p>

        <!-- In-stock: history note + call CTAs. On-order: import request form -->
        <template v-if="v.status !== 'on_order'">
          <p v-if="v.vin" class="mt-3 text-sm text-neutral-500">✓ {{ t('detail.history_note') }}</p>
          <div class="mt-5 flex flex-col gap-2">
            <button class="btn-primary" @click="showCallback = !showCallback">
              {{ t('cta.call_me') }}
            </button>
          </div>
          <div v-if="showCallback" class="card mt-3 p-4">
            <LeadForm type="callback" :vehicle-id="v.id" :show-message="false" />
          </div>
        </template>
        <div v-else class="card mt-5 border border-primary/20 p-4">
          <p class="font-bold">{{ t('detail.request_import') }}</p>
          <LeadForm type="order_request" :vehicle-id="v.id" show-budget class="mt-3" />
        </div>

        <SellerCard v-if="v.seller" :seller="v.seller" class="mt-5" />
      </div>
    </div>

    <!-- Specs + description + features -->
    <div class="mt-10 grid gap-8 lg:grid-cols-5">
      <div class="lg:col-span-3">
        <h2 class="text-xl font-extrabold">{{ t('detail.specs') }}</h2>
        <dl class="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          <div v-for="[label, value] in specs" :key="label">
            <dt class="text-xs uppercase text-neutral-500">{{ label }}</dt>
            <dd class="font-bold">{{ value }}</dd>
          </div>
        </dl>

        <template v-if="v.description">
          <h2 class="mt-8 text-xl font-extrabold">{{ t('detail.description') }}</h2>
          <p class="mt-3 whitespace-pre-line text-neutral-900">{{ v.description }}</p>
        </template>
      </div>

      <div v-if="v.features.length" class="lg:col-span-2">
        <h2 class="text-xl font-extrabold">{{ t('detail.features') }}</h2>
        <ul class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <li
            v-for="code in v.features"
            :key="code"
            class="flex items-center gap-2 text-sm"
          >
            <span class="text-primary">✓</span> {{ t(`features.${code}`) }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Similar -->
    <template v-if="v.similar.length">
      <h2 class="mt-12 text-xl font-extrabold">{{ t('detail.similar') }}</h2>
      <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <VehicleCard v-for="s in v.similar" :key="s.id" :vehicle="s" />
      </div>
    </template>
  </div>
</template>
