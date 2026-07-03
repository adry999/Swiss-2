<script setup lang="ts">
const { t } = useI18n()

useHead({ title: t('testimonials_page.title') })
useSeoMeta({ description: t('testimonials_page.subtitle') })

const { data: testimonials } = await useFetch('/api/testimonials')

// AggregateRating structured data for rich results
const config = useRuntimeConfig()
useHead(() => {
  const items = testimonials.value ?? []
  if (!items.length) return {}
  const avg = items.reduce((s, x) => s + x.rating, 0) / items.length
  return {
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'AutoDealer',
          name: 'Swiss Cars',
          url: config.public.siteUrl,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: avg.toFixed(1),
            reviewCount: items.length,
          },
        }),
      },
    ],
  }
})
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-10 sm:py-14">
    <h1 class="text-2xl font-extrabold sm:text-3xl">{{ t('testimonials_page.title') }}</h1>
    <p class="mt-2 text-neutral-500">{{ t('testimonials_page.subtitle') }}</p>

    <div class="mt-6 grid gap-4 sm:grid-cols-2">
      <figure v-for="item in testimonials ?? []" :key="item.id" class="card p-5">
        <p aria-hidden="true" class="text-primary">{{ '★'.repeat(item.rating) }}</p>
        <blockquote class="mt-2 text-sm">{{ item.text }}</blockquote>
        <figcaption class="mt-3 text-sm font-bold">{{ item.authorName }}</figcaption>
      </figure>
    </div>
  </div>
</template>
