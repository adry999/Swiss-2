<script setup lang="ts">
const { t } = useI18n()

useHead({ title: t('form.order_title') })
useSeoMeta({ description: t('form.order_subtitle') })
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-10 sm:py-14">
    <h1 class="text-2xl font-extrabold sm:text-3xl">{{ t('form.order_title') }}</h1>
    <p class="mt-2 text-neutral-500">{{ t('form.order_subtitle') }}</p>

    <div class="card mt-6 p-5 sm:p-8">
      <LeadForm
        type="order_request"
        show-budget
        show-links
        :message-label="t('form.preferences')"
      />
    </div>
  </div>
</template>
