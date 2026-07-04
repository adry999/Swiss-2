<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Recenzii' })

const { data: items, refresh } = await useFetch('/api/admin/testimonials')

interface TestimonialForm {
  id?: string
  authorName: string
  text: string
  rating: number
  isVisible: boolean
  sortOrder: number
}

const form = ref<TestimonialForm | null>(null)
const saving = ref(false)

function startNew() {
  form.value = { authorName: '', text: '', rating: 5, isVisible: true, sortOrder: 0 }
}

async function save() {
  if (!form.value) return
  saving.value = true
  try {
    const { id, ...body } = form.value
    if (id) {
      await $fetch(`/api/admin/testimonials/${id}`, { method: 'PUT', body })
    } else {
      await $fetch('/api/admin/testimonials', { method: 'POST', body })
    }
    form.value = null
    await refresh()
  } finally {
    saving.value = false
  }
}

async function toggleVisible(id: string, isVisible: boolean) {
  await $fetch(`/api/admin/testimonials/${id}`, { method: 'PUT', body: { isVisible } })
  await refresh()
}

async function move(index: number, delta: number) {
  const list = items.value ?? []
  const other = index + delta
  if (other < 0 || other >= list.length) return
  await Promise.all([
    $fetch(`/api/admin/testimonials/${list[index].id}`, { method: 'PUT', body: { sortOrder: other } }),
    $fetch(`/api/admin/testimonials/${list[other].id}`, { method: 'PUT', body: { sortOrder: index } }),
  ])
  await refresh()
}

async function remove(id: string) {
  if (!confirm('Ștergi această recenzie?')) return
  await $fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
  await refresh()
}

const inputClass =
  'mt-1 w-full rounded-[8px] border border-neutral-100 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none'
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-extrabold">Recenzii</h1>
      <button class="btn-primary !py-2 text-sm" @click="startNew">+ Adaugă recenzie</button>
    </div>

    <form v-if="form" class="card mt-4 p-5" @submit.prevent="save">
      <div class="grid gap-4 sm:grid-cols-3">
        <label class="block text-sm font-medium">
          Autor *
          <input v-model="form.authorName" required :class="inputClass" />
        </label>
        <label class="block text-sm font-medium">
          Notă (1–5)
          <input v-model.number="form.rating" type="number" min="1" max="5" :class="inputClass" />
        </label>
        <label class="mt-6 flex items-center gap-2 text-sm font-medium">
          <input v-model="form.isVisible" type="checkbox" class="accent-primary" />
          Vizibilă pe site
        </label>
      </div>
      <label class="mt-3 block text-sm font-medium">
        Text *
        <textarea v-model="form.text" rows="3" required :class="inputClass" />
      </label>
      <div class="mt-4 flex gap-3">
        <button type="submit" class="btn-primary !py-2 text-sm" :disabled="saving">Salvează</button>
        <button type="button" class="btn-outline !py-2 text-sm" @click="form = null">Anulează</button>
      </div>
    </form>

    <div class="mt-4 space-y-3">
      <div
        v-for="(item, index) in items ?? []"
        :key="item.id"
        class="card flex flex-wrap items-start justify-between gap-3 p-4"
        :class="item.isVisible ? '' : 'opacity-60'"
      >
        <div class="min-w-0 flex-1">
          <p class="text-primary">{{ '★'.repeat(item.rating) }}</p>
          <p class="mt-1 text-sm">{{ item.text }}</p>
          <p class="mt-1 text-sm font-bold">{{ item.authorName }}</p>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <button class="btn-outline !px-2 !py-1 text-xs" title="Sus" @click="move(index, -1)">↑</button>
          <button class="btn-outline !px-2 !py-1 text-xs" title="Jos" @click="move(index, 1)">↓</button>
          <button
            class="btn-outline !px-2 !py-1 text-xs"
            @click="toggleVisible(item.id, !item.isVisible)"
          >
            {{ item.isVisible ? 'Ascunde' : 'Afișează' }}
          </button>
          <button class="font-bold text-primary" @click="form = { ...item }">Editează</button>
          <button class="text-neutral-500 hover:text-primary" @click="remove(item.id)">Șterge</button>
        </div>
      </div>
    </div>
  </div>
</template>
