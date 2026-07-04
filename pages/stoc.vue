<script setup lang="ts">
import type { CatalogFilters } from '~/components/FilterPanel.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

useHead({ title: t('catalog.title') })
useSeoMeta({ description: t('catalog.subtitle') })

const filters = reactive<CatalogFilters>({
  status: (route.query.status as string) ?? '',
  makeId: route.query.makeId ? Number(route.query.makeId) : null,
  modelId: route.query.modelId ? Number(route.query.modelId) : null,
  priceMin: route.query.priceMin ? Number(route.query.priceMin) : null,
  priceMax: route.query.priceMax ? Number(route.query.priceMax) : null,
  yearMin: route.query.yearMin ? Number(route.query.yearMin) : null,
  yearMax: route.query.yearMax ? Number(route.query.yearMax) : null,
  mileageMax: route.query.mileageMax ? Number(route.query.mileageMax) : null,
  fuelType: (route.query.fuelType as string) ?? '',
  transmission: (route.query.transmission as string) ?? '',
  bodyType: (route.query.bodyType as string) ?? '',
})
const sort = ref((route.query.sort as string) || 'newest')
const page = ref(Number(route.query.page) || 1)
const sheetOpen = ref(false)

const query = computed(() => {
  const q: Record<string, string> = {}
  for (const [key, value] of Object.entries({ ...filters, sort: sort.value, page: page.value })) {
    if (value !== null && value !== '' && !(key === 'page' && value === 1) && !(key === 'sort' && value === 'newest')) {
      q[key] = String(value)
    }
  }
  return q
})

const { data } = await useFetch('/api/vehicles', { query })

function apply() {
  page.value = 1
  sheetOpen.value = false
  router.replace({ query: query.value })
}

watch([sort, page], () => router.replace({ query: query.value }))

const totalPages = computed(() =>
  Math.max(1, Math.ceil((data.value?.total ?? 0) / (data.value?.perPage ?? 12))),
)
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <h1 class="text-2xl font-extrabold sm:text-3xl">{{ t('catalog.title') }}</h1>
    <p class="mt-1 text-neutral-500">{{ t('catalog.subtitle') }}</p>

    <div class="mt-6 flex items-center justify-between gap-3">
      <button class="btn-outline !px-4 !py-2 text-sm lg:hidden" @click="sheetOpen = true">
        {{ t('catalog.filters') }}
      </button>
      <p class="hidden text-sm text-neutral-500 lg:block">
        {{ t('catalog.results', { n: data?.total ?? 0 }) }}
      </p>
      <select
        v-model="sort"
        class="rounded-[8px] border border-neutral-100 bg-white px-3 py-2 text-sm"
        @change="page = 1"
      >
        <option value="newest">{{ t('catalog.sort_newest') }}</option>
        <option value="price_asc">{{ t('catalog.sort_price_asc') }}</option>
        <option value="price_desc">{{ t('catalog.sort_price_desc') }}</option>
        <option value="year_desc">{{ t('catalog.sort_year_desc') }}</option>
      </select>
    </div>

    <div class="mt-4 flex gap-8">
      <!-- Desktop sidebar -->
      <aside class="hidden w-64 shrink-0 lg:block">
        <div class="card sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-4">
          <FilterPanel v-model="filters" @apply="apply" />
        </div>
      </aside>

      <div class="min-w-0 flex-1">
        <div
          v-if="data?.items?.length"
          class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <VehicleCard v-for="v in data.items" :key="v.id" :vehicle="v" />
        </div>
        <p v-else class="py-16 text-center text-neutral-500">{{ t('catalog.no_results') }}</p>

        <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-3 text-sm">
          <button class="btn-outline !px-3 !py-1.5" :disabled="page <= 1" @click="page--">‹</button>
          <span>{{ page }} / {{ totalPages }}</span>
          <button class="btn-outline !px-3 !py-1.5" :disabled="page >= totalPages" @click="page++">›</button>
        </div>
      </div>
    </div>

    <!-- Mobile bottom sheet -->
    <Teleport to="body">
      <div v-if="sheetOpen" class="fixed inset-0 z-[90] lg:hidden">
        <div class="absolute inset-0 bg-black/40" @click="sheetOpen = false" />
        <div class="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[16px] bg-white p-5">
          <div class="mb-4 flex items-center justify-between">
            <p class="text-lg font-extrabold">{{ t('catalog.filters') }}</p>
            <button class="text-2xl" aria-label="Close" @click="sheetOpen = false">✕</button>
          </div>
          <FilterPanel v-model="filters" @apply="apply" />
        </div>
      </div>
    </Teleport>
  </div>
</template>
