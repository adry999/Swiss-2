<script setup lang="ts">
interface Seller {
  name: string
  phone: string
  whatsapp: string | null
  viber?: string | null
  photoUrl: string | null
  role: string | null
}

defineProps<{ seller: Seller }>()

const { t } = useI18n()

function waLink(number: string) {
  return `https://wa.me/${number.replace(/[^0-9]/g, '')}`
}
</script>

<template>
  <div class="card flex items-center gap-4 p-4">
    <img
      v-if="seller.photoUrl"
      :src="seller.photoUrl"
      :alt="seller.name"
      class="h-16 w-16 rounded-full object-cover"
    />
    <div
      v-else
      class="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-xl font-extrabold text-neutral-500"
    >
      {{ seller.name.charAt(0) }}
    </div>
    <div class="min-w-0 flex-1">
      <p class="font-bold">{{ seller.name }}</p>
      <p v-if="seller.role" class="text-xs text-neutral-500">{{ seller.role }}</p>
      <div class="mt-2 flex flex-wrap gap-2">
        <a :href="`tel:${seller.phone.replace(/\s/g, '')}`" class="btn-primary !px-3 !py-1.5 text-xs">
          {{ seller.phone }}
        </a>
        <a
          v-if="seller.whatsapp"
          :href="waLink(seller.whatsapp)"
          target="_blank"
          rel="noopener"
          class="btn-outline !px-3 !py-1.5 text-xs"
        >
          {{ t('cta.whatsapp') }}
        </a>
      </div>
    </div>
  </div>
</template>
