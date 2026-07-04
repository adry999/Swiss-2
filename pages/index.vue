<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

useHead({ title: t('home.title'), titleTemplate: '%s' })
useSeoMeta({ description: t('home.hero_subtitle') })

const { data: featured } = await useFetch('/api/vehicles', {
  query: { perPage: 8, sort: 'newest' },
})
const { data: testimonials } = await useFetch('/api/testimonials')
const { data: lookups } = await useFetch('/api/lookups')

// Quick search
const searchMakeId = ref<number | null>(null)
const searchModelId = ref<number | null>(null)
const searchPriceMax = ref<number | null>(null)

const searchModels = computed(
  () => lookups.value?.makes.find((m) => m.id === searchMakeId.value)?.models ?? [],
)
watch(searchMakeId, () => (searchModelId.value = null))

function search() {
  const query: Record<string, string> = {}
  if (searchMakeId.value) query.makeId = String(searchMakeId.value)
  if (searchModelId.value) query.modelId = String(searchModelId.value)
  if (searchPriceMax.value) query.priceMax = String(searchPriceMax.value)
  router.push({ path: localePath('/stoc'), query })
}

const openFaq = ref<number | null>(0)

interface FaqItem {
  q: string
  a: string
}
const { tm, rt } = useI18n()
const faqItems = computed(() =>
  (tm('home.faq') as unknown[]).map((item) => {
    const entry = item as { q: unknown; a: unknown }
    return { q: rt(entry.q as string), a: rt(entry.a as string) } satisfies FaqItem
  }),
)

const inputClass =
  'w-full rounded-[8px] border-0 bg-white px-3 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary'
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="bg-charcoal text-white">
      <div class="mx-auto max-w-7xl px-4 py-14 sm:py-20">
        <h1 class="max-w-2xl text-3xl font-extrabold sm:text-5xl">
          {{ t('home.hero_title') }}
        </h1>
        <p class="mt-4 max-w-xl text-neutral-300">{{ t('home.hero_subtitle') }}</p>

        <!-- Quick search -->
        <form
          class="mt-8 grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-4"
          @submit.prevent="search"
        >
          <select v-model.number="searchMakeId" :class="inputClass">
            <option :value="null">{{ t('home.search_make') }} — {{ t('home.search_any') }}</option>
            <option v-for="m in lookups?.makes ?? []" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
          <select v-model.number="searchModelId" :class="inputClass" :disabled="!searchMakeId">
            <option :value="null">{{ t('home.search_model') }}</option>
            <option v-for="m in searchModels" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
          <input
            v-model.number="searchPriceMax"
            type="number"
            min="0"
            :placeholder="`${t('home.search_price')} (€)`"
            :class="inputClass"
          />
          <button type="submit" class="btn-primary">{{ t('home.search_btn') }}</button>
        </form>
      </div>
    </section>

    <!-- How it works -->
    <section class="mx-auto max-w-7xl px-4 py-12 sm:py-16">
      <h2 class="text-2xl font-extrabold sm:text-3xl">{{ t('home.how_title') }}</h2>
      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <div class="card border-t-4 border-primary p-6">
          <span class="badge-in-stock">{{ t('status.in_stock') }}</span>
          <h3 class="mt-3 text-lg font-extrabold">{{ t('home.how_stock_title') }}</h3>
          <p class="mt-2 text-sm text-neutral-500">{{ t('home.how_stock_text') }}</p>
          <NuxtLink :to="localePath({ path: '/stoc', query: { status: 'in_stock' } })" class="mt-4 inline-block font-bold text-primary hover:underline">
            {{ t('cta.view_all') }} →
          </NuxtLink>
        </div>
        <div class="card border-t-4 border-neutral-100 p-6">
          <span class="badge-on-order">{{ t('status.on_order') }}</span>
          <h3 class="mt-3 text-lg font-extrabold">{{ t('home.how_order_title') }}</h3>
          <p class="mt-2 text-sm text-neutral-500">{{ t('home.how_order_text') }}</p>
          <NuxtLink :to="localePath('/comanda')" class="mt-4 inline-block font-bold text-primary hover:underline">
            {{ t('cta.request_import') }} →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Featured / latest -->
    <section class="bg-neutral-100 py-12 sm:py-16">
      <div class="mx-auto max-w-7xl px-4">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-extrabold sm:text-3xl">{{ t('home.featured_title') }}</h2>
          <NuxtLink :to="localePath('/stoc')" class="font-bold text-primary hover:underline">
            {{ t('cta.view_all') }} →
          </NuxtLink>
        </div>
        <div class="mt-6 flex snap-x gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
          <VehicleCard
            v-for="v in featured?.items ?? []"
            :key="v.id"
            :vehicle="v"
            class="w-72 shrink-0 snap-start sm:w-auto"
          />
        </div>
      </div>
    </section>

    <!-- Trust strip -->
    <section class="mx-auto max-w-7xl px-4 py-12">
      <div class="grid grid-cols-1 gap-6 text-center sm:grid-cols-3">
        <div>
          <p class="text-4xl font-extrabold text-primary">10+</p>
          <p class="mt-1 text-sm text-neutral-500">{{ t('home.trust_years') }}</p>
        </div>
        <div>
          <p class="text-4xl font-extrabold text-primary">500+</p>
          <p class="mt-1 text-sm text-neutral-500">{{ t('home.trust_imported') }}</p>
        </div>
        <div>
          <p class="text-4xl font-extrabold text-primary">🇨🇭 100%</p>
          <p class="mt-1 text-sm text-neutral-500">{{ t('home.trust_origin') }}</p>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section v-if="testimonials?.length" class="bg-neutral-100 py-12 sm:py-16">
      <div class="mx-auto max-w-7xl px-4">
        <h2 class="text-2xl font-extrabold sm:text-3xl">{{ t('home.testimonials_title') }}</h2>
        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <figure v-for="item in testimonials.slice(0, 3)" :key="item.id" class="card p-5">
            <p aria-hidden="true" class="text-primary">{{ '★'.repeat(item.rating) }}</p>
            <blockquote class="mt-2 text-sm">{{ item.text }}</blockquote>
            <figcaption class="mt-3 text-sm font-bold">{{ item.authorName }}</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- Leasing teaser -->
    <section class="mx-auto max-w-7xl px-4 py-12">
      <div class="card flex flex-col items-start gap-4 bg-charcoal p-8 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-extrabold sm:text-2xl">{{ t('home.leasing_title') }}</h2>
          <p class="mt-1 text-sm text-neutral-300">{{ t('home.leasing_text') }}</p>
        </div>
        <NuxtLink :to="localePath('/leasing')" class="btn-primary shrink-0">
          {{ t('home.leasing_cta') }}
        </NuxtLink>
      </div>
    </section>

    <!-- FAQ -->
    <section class="mx-auto max-w-3xl px-4 pb-16">
      <h2 class="text-2xl font-extrabold sm:text-3xl">{{ t('home.faq_title') }}</h2>
      <div class="mt-6 divide-y divide-neutral-100">
        <details
          v-for="(item, index) in faqItems"
          :key="index"
          :open="openFaq === index"
          class="group py-4"
          @toggle="($event.target as HTMLDetailsElement).open && (openFaq = index)"
        >
          <summary class="cursor-pointer list-none font-bold marker:hidden">
            {{ item.q }}
          </summary>
          <p class="mt-2 text-sm text-neutral-500">{{ item.a }}</p>
        </details>
      </div>
    </section>
  </div>
</template>
