<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const favorites = useFavoritesStore()

useHead({ title: t('favorites.title'), meta: [{ name: 'robots', content: 'noindex' }] })

const idsQuery = computed(() => favorites.ids.join(','))

const { data } = await useFetch('/api/vehicles', {
  query: { ids: idsQuery, perPage: 48 },
  // No ids -> API would return the whole catalog; skip the call instead
  immediate: favorites.ids.length > 0,
  watch: [idsQuery],
})

const items = computed(() =>
  favorites.ids.length
    ? (data.value?.items ?? []).filter((v) => favorites.has(v.id))
    : [],
)
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <h1 class="text-2xl font-extrabold sm:text-3xl">{{ t('favorites.title') }}</h1>

    <div v-if="items.length" class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <VehicleCard v-for="v in items" :key="v.id" :vehicle="v" />
    </div>
    <div v-else class="py-16 text-center">
      <p class="text-4xl">♡</p>
      <p class="mt-3 text-neutral-500">{{ t('favorites.empty') }}</p>
      <NuxtLink :to="localePath('/stoc')" class="btn-primary mt-6 inline-flex">
        {{ t('nav.stock') }}
      </NuxtLink>
    </div>
  </div>
</template>
