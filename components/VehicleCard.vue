<script setup lang="ts">
interface VehicleItem {
  slug: string
  make: string
  model: string
  year: number
  price: number | null
  priceType: 'fixed' | 'estimated'
  status: 'in_stock' | 'on_order' | 'reserved' | 'sold'
  mileageKm: number | null
  fuelType: string
  transmission: string
  thumbnailUrl?: string | null
  photoUrl?: string | null
}

const props = defineProps<{ vehicle: VehicleItem }>()

const { t } = useI18n()
const localePath = useLocalePath()

const badgeClass = computed(
  () =>
    ({
      in_stock: 'badge-in-stock',
      on_order: 'badge-on-order',
      reserved: 'badge-reserved',
      sold: 'badge-sold',
    })[props.vehicle.status],
)

const price = computed(() => {
  if (props.vehicle.price == null) return t('vehicle.price_estimated')
  const formatted = `€${props.vehicle.price.toLocaleString('ro-RO')}`
  return props.vehicle.priceType === 'estimated' ? `~${formatted}` : formatted
})

const image = computed(
  () => props.vehicle.photoUrl ?? props.vehicle.thumbnailUrl ?? null,
)
</script>

<template>
  <NuxtLink
    :to="localePath(`/vehicul/${vehicle.slug}`)"
    class="card group block overflow-hidden transition-shadow hover:shadow-lg"
  >
    <div class="relative aspect-[4/3] overflow-hidden bg-neutral-100">
      <img
        v-if="image"
        :src="image"
        :alt="`${vehicle.make} ${vehicle.model} ${vehicle.year}`"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        :class="vehicle.status === 'sold' ? 'opacity-60 grayscale' : ''"
      />
      <div v-else class="flex h-full items-center justify-center text-4xl text-neutral-500">🚗</div>
      <span class="absolute left-3 top-3" :class="badgeClass">
        {{ t(`status.${vehicle.status}`) }}
      </span>
    </div>
    <div class="p-4">
      <h3 class="truncate font-bold">
        {{ vehicle.make }} {{ vehicle.model }}
        <span class="text-neutral-500">{{ vehicle.year }}</span>
      </h3>
      <p
        class="mt-1 text-lg font-extrabold"
        :class="vehicle.status === 'sold' ? 'text-neutral-500 line-through' : 'text-primary'"
      >
        {{ price }}
      </p>
      <p class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
        <span v-if="vehicle.mileageKm != null">{{ vehicle.mileageKm.toLocaleString('ro-RO') }} km</span>
        <span>{{ t(`fuel.${vehicle.fuelType}`) }}</span>
        <span>{{ t(`transmission_types.${vehicle.transmission}`) }}</span>
      </p>
    </div>
  </NuxtLink>
</template>
