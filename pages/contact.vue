<script setup lang="ts">
const { t } = useI18n()

useHead({ title: t('contact.title') })

const { data: site } = await useFetch('/api/site-settings')

const company = computed(
  () =>
    (site.value?.company ?? {}) as {
      name?: string
      address?: string
      phones?: string[]
      email?: string
      workingHours?: string
    },
)
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-10 sm:py-14">
    <h1 class="text-2xl font-extrabold sm:text-3xl">{{ t('contact.title') }}</h1>

    <div class="mt-6 grid gap-6 sm:grid-cols-2">
      <div class="space-y-4">
        <div v-if="company.address" class="card p-5">
          <p class="text-xs font-bold uppercase text-neutral-500">{{ t('contact.address') }}</p>
          <p class="mt-1 font-bold">{{ company.address }}</p>
        </div>
        <div v-if="company.phones?.length" class="card p-5">
          <p class="text-xs font-bold uppercase text-neutral-500">{{ t('contact.phones') }}</p>
          <p v-for="phone in company.phones" :key="phone" class="mt-1">
            <a :href="`tel:${phone.replace(/\s/g, '')}`" class="font-bold text-primary">{{ phone }}</a>
          </p>
        </div>
        <div v-if="company.email" class="card p-5">
          <p class="text-xs font-bold uppercase text-neutral-500">{{ t('contact.email') }}</p>
          <a :href="`mailto:${company.email}`" class="mt-1 font-bold text-primary">{{ company.email }}</a>
        </div>
        <div v-if="company.workingHours" class="card p-5">
          <p class="text-xs font-bold uppercase text-neutral-500">{{ t('contact.hours') }}</p>
          <p class="mt-1 font-bold">{{ company.workingHours }}</p>
        </div>
      </div>

      <div class="card p-5 sm:p-6">
        <h2 class="font-bold">{{ t('contact.form_title') }}</h2>
        <LeadForm type="contact" class="mt-4" />
      </div>
    </div>
  </div>
</template>
