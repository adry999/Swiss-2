<script setup lang="ts">
const { t } = useI18n()

useHead({ title: t('about.title') })
useSeoMeta({ description: t('about.text').slice(0, 160) })

const { data: sellers } = await useFetch('/api/sellers')
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-10 sm:py-14">
    <h1 class="text-2xl font-extrabold sm:text-3xl">{{ t('about.title') }}</h1>
    <p class="mt-4 max-w-2xl leading-relaxed text-neutral-900">{{ t('about.text') }}</p>

    <div class="mt-8 grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
      <div class="card p-5">
        <p class="text-3xl font-extrabold text-primary">10+</p>
        <p class="mt-1 text-sm text-neutral-500">{{ t('home.trust_years') }}</p>
      </div>
      <div class="card p-5">
        <p class="text-3xl font-extrabold text-primary">500+</p>
        <p class="mt-1 text-sm text-neutral-500">{{ t('home.trust_imported') }}</p>
      </div>
      <div class="card p-5">
        <p class="text-3xl font-extrabold text-primary">🇨🇭</p>
        <p class="mt-1 text-sm text-neutral-500">{{ t('home.trust_origin') }}</p>
      </div>
    </div>

    <template v-if="sellers?.length">
      <h2 class="mt-12 text-xl font-extrabold">{{ t('about.team_title') }}</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <SellerCard v-for="seller in sellers" :key="seller.id" :seller="seller" />
      </div>
    </template>
  </div>
</template>
