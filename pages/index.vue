<script setup lang="ts">
const { t } = useI18n()

useHead({ title: t('home.title') })
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-16 text-center sm:py-24">
    <h1 class="mx-auto max-w-2xl text-3xl font-extrabold sm:text-5xl">
      {{ t('home.hero_title') }}
    </h1>
    <p class="mx-auto mt-4 max-w-xl text-neutral-500">
      {{ t('home.hero_subtitle') }}
    </p>
    <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
      <span class="badge-in-stock">{{ t('status.in_stock') }}</span>
      <span class="badge-on-order">{{ t('status.on_order') }}</span>
    </div>
  </section>
</template>
