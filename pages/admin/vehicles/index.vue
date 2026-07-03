<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Vehicule' })

const q = ref('')
const status = ref('')
const page = ref(1)

const { data, refresh } = await useFetch('/api/admin/vehicles', {
  query: { q, status, page },
})

const statusLabels: Record<string, string> = {
  in_stock: 'În stoc',
  on_order: 'La comandă',
  reserved: 'Rezervat',
  sold: 'Vândut',
}
const statusClasses: Record<string, string> = {
  in_stock: 'badge-in-stock',
  on_order: 'badge-on-order',
  reserved: 'badge-reserved',
  sold: 'badge-sold',
}

const totalPages = computed(() =>
  Math.max(1, Math.ceil((data.value?.total ?? 0) / (data.value?.perPage ?? 20))),
)

async function remove(id: string, title: string) {
  if (!confirm(`Ștergi vehiculul „${title}"? Acțiunea este ireversibilă.`)) return
  await $fetch(`/api/admin/vehicles/${id}`, { method: 'DELETE' })
  await refresh()
}

function fmtPrice(v: { price: number | null; priceType: string }) {
  if (v.price == null) return '—'
  const p = `€${v.price.toLocaleString('ro-RO')}`
  return v.priceType === 'estimated' ? `~${p}` : p
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-extrabold">Vehicule</h1>
      <NuxtLink to="/admin/vehicles/new" class="btn-primary !py-2 text-sm">
        + Adaugă vehicul
      </NuxtLink>
    </div>

    <div class="mt-4 flex flex-wrap gap-3">
      <input
        v-model="q"
        placeholder="Caută după marcă, model, cod, VIN…"
        class="w-full max-w-xs rounded-[8px] border border-neutral-100 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
        @input="page = 1"
      />
      <select
        v-model="status"
        class="rounded-[8px] border border-neutral-100 bg-white px-3 py-2 text-sm"
        @change="page = 1"
      >
        <option value="">Toate statusurile</option>
        <option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>

    <div class="card mt-4 overflow-x-auto">
      <table class="w-full min-w-[720px] text-sm">
        <thead>
          <tr class="border-b border-neutral-100 text-left text-xs uppercase text-neutral-500">
            <th class="px-4 py-3">Vehicul</th>
            <th class="px-4 py-3">Cod</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Preț</th>
            <th class="px-4 py-3">Vizualizări</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="v in data?.items ?? []"
            :key="v.id"
            class="border-b border-neutral-100 last:border-0 hover:bg-neutral-100/50"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img
                  v-if="v.thumbnailUrl"
                  :src="v.thumbnailUrl"
                  class="h-10 w-14 rounded object-cover"
                  alt=""
                />
                <div v-else class="h-10 w-14 rounded bg-neutral-100" />
                <div>
                  <p class="font-bold">
                    {{ v.make }} {{ v.model }} {{ v.year }}
                    <span v-if="v.isFeatured" title="Promovat">★</span>
                  </p>
                  <p class="text-xs text-neutral-500">{{ v.mileageKm?.toLocaleString('ro-RO') ?? '—' }} km</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 font-mono text-xs">{{ v.productCode }}</td>
            <td class="px-4 py-3">
              <span :class="statusClasses[v.status]">{{ statusLabels[v.status] }}</span>
            </td>
            <td class="px-4 py-3 font-bold">{{ fmtPrice(v) }}</td>
            <td class="px-4 py-3 text-neutral-500">{{ v.viewsCount }}</td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <NuxtLink :to="`/admin/vehicles/${v.id}`" class="font-bold text-primary hover:underline">
                Editează
              </NuxtLink>
              <button
                class="ml-4 text-neutral-500 hover:text-primary"
                @click="remove(v.id, `${v.make} ${v.model} ${v.year}`)"
              >
                Șterge
              </button>
            </td>
          </tr>
          <tr v-if="!data?.items?.length">
            <td colspan="6" class="px-4 py-10 text-center text-neutral-500">
              Niciun vehicul găsit.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="mt-4 flex items-center gap-2 text-sm">
      <button class="btn-outline !px-3 !py-1.5" :disabled="page <= 1" @click="page--">‹</button>
      <span>Pagina {{ page }} / {{ totalPages }}</span>
      <button class="btn-outline !px-3 !py-1.5" :disabled="page >= totalPages" @click="page++">›</button>
    </div>
  </div>
</template>
