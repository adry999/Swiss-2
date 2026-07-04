<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Solicitări' })

const type = ref('')
const status = ref('')
const page = ref(1)

const { data, refresh } = await useFetch('/api/admin/leads', {
  query: { type, status, page },
})
const { data: sellers } = await useFetch('/api/admin/sellers')

const typeLabels: Record<string, string> = {
  order_request: 'Comandă auto',
  contact: 'Contact',
  financing: 'Finanțare',
  callback: 'Sună-mă',
}
const statusLabels: Record<string, string> = {
  new: 'Nouă',
  contacted: 'Contactat',
  closed: 'Închisă',
}
const statusClasses: Record<string, string> = {
  new: 'badge-in-stock',
  contacted: 'badge-on-order',
  closed: 'badge-reserved',
}

const totalPages = computed(() =>
  Math.max(1, Math.ceil((data.value?.total ?? 0) / (data.value?.perPage ?? 20))),
)

async function update(id: string, patch: Record<string, unknown>) {
  await $fetch(`/api/admin/leads/${id}`, { method: 'PUT', body: patch })
  await refresh()
}

const expanded = ref<string | null>(null)
</script>

<template>
  <div>
    <h1 class="text-2xl font-extrabold">Solicitări</h1>

    <div class="mt-4 flex flex-wrap gap-3">
      <select v-model="type" class="rounded-[8px] border border-neutral-100 bg-white px-3 py-2 text-sm" @change="page = 1">
        <option value="">Toate tipurile</option>
        <option v-for="(label, key) in typeLabels" :key="key" :value="key">{{ label }}</option>
      </select>
      <select v-model="status" class="rounded-[8px] border border-neutral-100 bg-white px-3 py-2 text-sm" @change="page = 1">
        <option value="">Toate statusurile</option>
        <option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>

    <div class="mt-4 space-y-3">
      <div v-for="lead in data?.items ?? []" :key="lead.id" class="card p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded bg-neutral-100 px-2 py-0.5 text-xs font-bold">{{ typeLabels[lead.type] }}</span>
              <span :class="statusClasses[lead.status]">{{ statusLabels[lead.status] }}</span>
              <span class="text-xs text-neutral-500">
                {{ new Date(lead.createdAt).toLocaleString('ro-RO') }}
              </span>
            </div>
            <p class="mt-2 font-bold">
              {{ lead.name }} —
              <a :href="`tel:${lead.phone.replace(/\s/g, '')}`" class="text-primary">{{ lead.phone }}</a>
            </p>
            <p v-if="lead.vehicle" class="text-sm text-neutral-500">
              🚗 {{ lead.vehicle.make.name }} {{ lead.vehicle.model.name }} {{ lead.vehicle.year }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <select
              :value="lead.assignedSellerId ?? ''"
              class="rounded-[8px] border border-neutral-100 bg-white px-2 py-1.5 text-xs"
              @change="update(lead.id, { assignedSellerId: ($event.target as HTMLSelectElement).value || null })"
            >
              <option value="">Neasignat</option>
              <option v-for="s in sellers ?? []" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
            <select
              :value="lead.status"
              class="rounded-[8px] border border-neutral-100 bg-white px-2 py-1.5 text-xs font-bold"
              @change="update(lead.id, { status: ($event.target as HTMLSelectElement).value })"
            >
              <option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option>
            </select>
            <button
              v-if="lead.message || lead.budget || lead.referenceLinks || lead.email"
              class="text-xs font-bold text-primary"
              @click="expanded = expanded === lead.id ? null : lead.id"
            >
              {{ expanded === lead.id ? 'Ascunde' : 'Detalii' }}
            </button>
          </div>
        </div>

        <div v-if="expanded === lead.id" class="mt-3 rounded-[8px] bg-neutral-100 p-3 text-sm">
          <p v-if="lead.email"><b>Email:</b> {{ lead.email }}</p>
          <p v-if="lead.budget"><b>Buget:</b> €{{ lead.budget.toLocaleString('ro-RO') }}</p>
          <p v-if="lead.message" class="mt-1 whitespace-pre-line"><b>Mesaj:</b> {{ lead.message }}</p>
          <p v-if="lead.referenceLinks" class="mt-1 break-all"><b>Linkuri:</b> {{ lead.referenceLinks }}</p>
        </div>
      </div>

      <p v-if="!data?.items?.length" class="card px-4 py-10 text-center text-neutral-500">
        Nicio solicitare.
      </p>
    </div>

    <div v-if="totalPages > 1" class="mt-4 flex items-center gap-2 text-sm">
      <button class="btn-outline !px-3 !py-1.5" :disabled="page <= 1" @click="page--">‹</button>
      <span>Pagina {{ page }} / {{ totalPages }}</span>
      <button class="btn-outline !px-3 !py-1.5" :disabled="page >= totalPages" @click="page++">›</button>
    </div>
  </div>
</template>
