<script setup lang="ts">
const { t } = useI18n()

useHead({ title: t('leasing.title') })
useSeoMeta({ description: t('leasing.subtitle') })

const { data: site } = await useFetch('/api/site-settings')

const financing = computed(() => ({
  annualInterestRate: 9.5,
  minTermMonths: 12,
  maxTermMonths: 72,
  minDownPaymentPct: 20,
  ...((site.value?.financing as object) ?? {}),
}))

const price = ref(20000)
const downPct = ref(financing.value.minDownPaymentPct)
const term = ref(48)

const monthly = computed(() => {
  const principal = price.value * (1 - downPct.value / 100)
  const i = financing.value.annualInterestRate / 100 / 12
  if (principal <= 0 || term.value <= 0) return 0
  if (i === 0) return Math.round(principal / term.value)
  return Math.round((principal * i) / (1 - (1 + i) ** -term.value))
})

interface Partner {
  name: string
  logo?: string
  terms?: string
}
const partners = computed(() => (site.value?.leasingPartners as Partner[]) ?? [])
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-10 sm:py-14">
    <h1 class="text-2xl font-extrabold sm:text-3xl">{{ t('leasing.title') }}</h1>
    <p class="mt-2 text-neutral-500">{{ t('leasing.subtitle') }}</p>

    <div class="card mt-6 p-5 sm:p-8">
      <div class="grid gap-6 sm:grid-cols-2">
        <div class="space-y-5">
          <label class="block text-sm font-bold">
            {{ t('leasing.price') }}
            <input
              v-model.number="price"
              type="number"
              min="1000"
              step="500"
              class="mt-1 w-full rounded-[8px] border border-neutral-100 bg-neutral-100 px-3 py-2.5 focus:border-primary focus:outline-none"
            />
          </label>
          <label class="block text-sm font-bold">
            {{ t('leasing.down_payment', { pct: downPct }) }}
            <input
              v-model.number="downPct"
              type="range"
              :min="financing.minDownPaymentPct"
              max="80"
              class="mt-2 w-full accent-primary"
            />
          </label>
          <label class="block text-sm font-bold">
            {{ t('leasing.term') }}: {{ term }}
            <input
              v-model.number="term"
              type="range"
              :min="financing.minTermMonths"
              :max="financing.maxTermMonths"
              step="6"
              class="mt-2 w-full accent-primary"
            />
          </label>
        </div>

        <div class="flex flex-col items-center justify-center rounded-[12px] bg-neutral-100 p-6 text-center">
          <p class="text-sm text-neutral-500">{{ t('leasing.monthly') }}</p>
          <p class="mt-2 text-4xl font-extrabold text-primary">€{{ monthly.toLocaleString('ro-RO') }}</p>
          <p class="mt-3 text-xs text-neutral-500">{{ t('leasing.note') }}</p>
        </div>
      </div>
    </div>

    <template v-if="partners.length">
      <h2 class="mt-10 text-xl font-extrabold">{{ t('leasing.partners_title') }}</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-3">
        <div v-for="partner in partners" :key="partner.name" class="card p-5 text-center">
          <img v-if="partner.logo" :src="partner.logo" :alt="partner.name" class="mx-auto h-10 object-contain" />
          <p class="mt-2 font-bold">{{ partner.name }}</p>
          <p v-if="partner.terms" class="mt-1 text-xs text-neutral-500">{{ partner.terms }}</p>
        </div>
      </div>
    </template>

    <!-- Financing request -->
    <div class="card mt-10 p-5 sm:p-8">
      <h2 class="text-xl font-extrabold">{{ t('leasing.request_title') }}</h2>
      <p class="mt-1 text-sm text-neutral-500">{{ t('leasing.request_subtitle') }}</p>
      <LeadForm type="financing" show-budget class="mt-5 max-w-lg" />
    </div>
  </div>
</template>
