<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Vânzători' })

const { data: sellers, refresh } = await useFetch('/api/admin/sellers')

interface SellerForm {
  id?: string
  name: string
  phone: string
  whatsapp: string | null
  viber: string | null
  photoUrl: string | null
  role: string | null
  isActive: boolean
  sortOrder: number
}

const emptyForm = (): SellerForm => ({
  name: '',
  phone: '',
  whatsapp: null,
  viber: null,
  photoUrl: null,
  role: null,
  isActive: true,
  sortOrder: 0,
})

const form = ref<SellerForm | null>(null)
const saving = ref(false)
const error = ref('')

function edit(seller: NonNullable<typeof sellers.value>[number]) {
  form.value = { ...seller }
}

async function save() {
  if (!form.value) return
  saving.value = true
  error.value = ''
  try {
    const { id, ...body } = form.value
    if (id) {
      await $fetch(`/api/admin/sellers/${id}`, { method: 'PUT', body })
    } else {
      await $fetch('/api/admin/sellers', { method: 'POST', body })
    }
    form.value = null
    await refresh()
  } catch {
    error.value = 'Eroare la salvare. Verifică câmpurile obligatorii.'
  } finally {
    saving.value = false
  }
}

async function remove(id: string, name: string) {
  if (!confirm(`Ștergi vânzătorul „${name}"?`)) return
  await $fetch(`/api/admin/sellers/${id}`, { method: 'DELETE' })
  await refresh()
}

const inputClass =
  'mt-1 w-full rounded-[8px] border border-neutral-100 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none'
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-extrabold">Vânzători</h1>
      <button class="btn-primary !py-2 text-sm" @click="form = emptyForm()">+ Adaugă vânzător</button>
    </div>

    <!-- Inline form -->
    <form v-if="form" class="card mt-4 p-5" @submit.prevent="save">
      <h2 class="font-bold">{{ form.id ? 'Editează' : 'Vânzător nou' }}</h2>
      <div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <label class="block text-sm font-medium">
          Nume *
          <input v-model="form.name" required :class="inputClass" />
        </label>
        <label class="block text-sm font-medium">
          Telefon *
          <input v-model="form.phone" required :class="inputClass" />
        </label>
        <label class="block text-sm font-medium">
          WhatsApp
          <input v-model="form.whatsapp" :class="inputClass" />
        </label>
        <label class="block text-sm font-medium">
          Viber
          <input v-model="form.viber" :class="inputClass" />
        </label>
        <label class="block text-sm font-medium">
          Funcție
          <input v-model="form.role" :class="inputClass" placeholder="Sales Manager" />
        </label>
        <label class="block text-sm font-medium">
          Ordine afișare
          <input v-model.number="form.sortOrder" type="number" :class="inputClass" />
        </label>
      </div>
      <label class="mt-4 flex items-center gap-2 text-sm font-medium">
        <input v-model="form.isActive" type="checkbox" class="accent-primary" />
        Activ
      </label>
      <p v-if="error" class="mt-3 text-sm font-medium text-primary">{{ error }}</p>
      <div class="mt-4 flex gap-3">
        <button type="submit" class="btn-primary !py-2 text-sm" :disabled="saving">
          {{ saving ? 'Se salvează…' : 'Salvează' }}
        </button>
        <button type="button" class="btn-outline !py-2 text-sm" @click="form = null">Anulează</button>
      </div>
    </form>

    <div class="card mt-4 overflow-x-auto">
      <table class="w-full min-w-[560px] text-sm">
        <thead>
          <tr class="border-b border-neutral-100 text-left text-xs uppercase text-neutral-500">
            <th class="px-4 py-3">Nume</th>
            <th class="px-4 py-3">Telefon</th>
            <th class="px-4 py-3">Funcție</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="seller in sellers ?? []"
            :key="seller.id"
            class="border-b border-neutral-100 last:border-0"
          >
            <td class="px-4 py-3 font-bold">{{ seller.name }}</td>
            <td class="px-4 py-3">{{ seller.phone }}</td>
            <td class="px-4 py-3 text-neutral-500">{{ seller.role ?? '—' }}</td>
            <td class="px-4 py-3">
              <span :class="seller.isActive ? 'badge-in-stock' : 'badge-reserved'">
                {{ seller.isActive ? 'Activ' : 'Inactiv' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <button class="font-bold text-primary hover:underline" @click="edit(seller)">Editează</button>
              <button class="ml-4 text-neutral-500 hover:text-primary" @click="remove(seller.id, seller.name)">
                Șterge
              </button>
            </td>
          </tr>
          <tr v-if="!sellers?.length">
            <td colspan="5" class="px-4 py-10 text-center text-neutral-500">Niciun vânzător.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
