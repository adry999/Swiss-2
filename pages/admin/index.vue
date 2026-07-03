<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Dashboard' })

const { data: stats } = await useFetch('/api/admin/dashboard')

const cards = computed(() => [
  { label: 'Vehicule active', value: stats.value?.activeVehicles ?? 0 },
  { label: 'Solicitări noi', value: stats.value?.newLeads ?? 0 },
  { label: 'Vizualizări totale', value: stats.value?.totalViews ?? 0 },
  { label: 'Vândute luna aceasta', value: stats.value?.soldThisMonth ?? 0 },
])
</script>

<template>
  <div>
    <h1 class="text-2xl font-extrabold">Dashboard</h1>
    <div class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div v-for="card in cards" :key="card.label" class="card p-5">
        <p class="text-3xl font-extrabold text-primary">{{ card.value }}</p>
        <p class="mt-1 text-sm text-neutral-500">{{ card.label }}</p>
      </div>
    </div>
  </div>
</template>
