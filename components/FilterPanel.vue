<script setup lang="ts">
export interface CatalogFilters {
  status: string
  makeId: number | null
  modelId: number | null
  priceMin: number | null
  priceMax: number | null
  yearMin: number | null
  yearMax: number | null
  mileageMax: number | null
  fuelType: string
  transmission: string
  bodyType: string
}

const filters = defineModel<CatalogFilters>({ required: true })
const emit = defineEmits<{ apply: [] }>()

const { t } = useI18n()

const { data: lookups } = await useFetch('/api/lookups')

const availableModels = computed(
  () =>
    lookups.value?.makes.find((m) => m.id === filters.value.makeId)?.models ??
    [],
)

watch(
  () => filters.value.makeId,
  () => {
    if (!availableModels.value.some((m) => m.id === filters.value.modelId)) {
      filters.value.modelId = null
    }
  },
)

const fuelTypes = ['petrol', 'diesel', 'hybrid', 'plugin_hybrid', 'electric', 'lpg']
const bodyTypes = ['sedan', 'hatchback', 'wagon', 'suv', 'crossover', 'coupe', 'cabriolet', 'minivan', 'pickup', 'van']

function reset() {
  Object.assign(filters.value, {
    status: '',
    makeId: null,
    modelId: null,
    priceMin: null,
    priceMax: null,
    yearMin: null,
    yearMax: null,
    mileageMax: null,
    fuelType: '',
    transmission: '',
    bodyType: '',
  })
  emit('apply')
}

const inputClass =
  'mt-1 w-full rounded-[8px] border border-neutral-100 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none'
</script>

<template>
  <div class="space-y-4">
    <!-- Status -->
    <div>
      <p class="text-sm font-bold">{{ t('catalog.all_statuses') }} / {{ t('status.in_stock') }} / {{ t('status.on_order') }}</p>
      <div class="mt-2 flex gap-2">
        <button
          v-for="opt in ['', 'in_stock', 'on_order']"
          :key="opt"
          type="button"
          class="rounded-full px-3 py-1.5 text-xs font-bold"
          :class="filters.status === opt ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-900'"
          @click="filters.status = opt; emit('apply')"
        >
          {{ opt ? t(`status.${opt}`) : t('catalog.all_statuses') }}
        </button>
      </div>
    </div>

    <label class="block text-sm font-bold">
      {{ t('home.search_make') }}
      <select v-model.number="filters.makeId" :class="inputClass">
        <option :value="null">{{ t('catalog.any') }}</option>
        <option v-for="m in lookups?.makes ?? []" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
    </label>

    <label class="block text-sm font-bold">
      {{ t('home.search_model') }}
      <select v-model.number="filters.modelId" :class="inputClass" :disabled="!filters.makeId">
        <option :value="null">{{ t('catalog.any') }}</option>
        <option v-for="m in availableModels" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
    </label>

    <div class="grid grid-cols-2 gap-2">
      <label class="block text-sm font-bold">
        {{ t('catalog.price_from') }}
        <input v-model.number="filters.priceMin" type="number" min="0" placeholder="€" :class="inputClass" />
      </label>
      <label class="block text-sm font-bold">
        {{ t('catalog.price_to') }}
        <input v-model.number="filters.priceMax" type="number" min="0" placeholder="€" :class="inputClass" />
      </label>
      <label class="block text-sm font-bold">
        {{ t('catalog.year_from') }}
        <input v-model.number="filters.yearMin" type="number" min="1980" :max="new Date().getFullYear() + 1" :class="inputClass" />
      </label>
      <label class="block text-sm font-bold">
        {{ t('catalog.year_to') }}
        <input v-model.number="filters.yearMax" type="number" min="1980" :max="new Date().getFullYear() + 1" :class="inputClass" />
      </label>
    </div>

    <label class="block text-sm font-bold">
      {{ t('catalog.mileage_max') }}
      <input v-model.number="filters.mileageMax" type="number" min="0" placeholder="km" :class="inputClass" />
    </label>

    <label class="block text-sm font-bold">
      {{ t('vehicle.fuel') }}
      <select v-model="filters.fuelType" :class="inputClass">
        <option value="">{{ t('catalog.any') }}</option>
        <option v-for="f in fuelTypes" :key="f" :value="f">{{ t(`fuel.${f}`) }}</option>
      </select>
    </label>

    <label class="block text-sm font-bold">
      {{ t('vehicle.transmission') }}
      <select v-model="filters.transmission" :class="inputClass">
        <option value="">{{ t('catalog.any') }}</option>
        <option value="automatic">{{ t('transmission_types.automatic') }}</option>
        <option value="manual">{{ t('transmission_types.manual') }}</option>
      </select>
    </label>

    <label class="block text-sm font-bold">
      {{ t('vehicle.body') }}
      <select v-model="filters.bodyType" :class="inputClass">
        <option value="">{{ t('catalog.any') }}</option>
        <option v-for="b in bodyTypes" :key="b" :value="b">{{ t(`body_types.${b}`) }}</option>
      </select>
    </label>

    <div class="flex gap-2 pt-1">
      <button type="button" class="btn-primary flex-1 !py-2 text-sm" @click="emit('apply')">
        {{ t('catalog.apply') }}
      </button>
      <button type="button" class="btn-outline !py-2 text-sm" @click="reset">
        {{ t('catalog.reset') }}
      </button>
    </div>
  </div>
</template>
