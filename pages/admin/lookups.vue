<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Mărci & dotări' })

const { data: lookups, refresh } = await useFetch('/api/admin/lookups')

const selectedMakeId = ref<number | null>(null)
const selectedMake = computed(
  () => lookups.value?.makes.find((m) => m.id === selectedMakeId.value) ?? null,
)

const newMake = ref('')
const newModel = ref('')
const newFeature = ref('')
const error = ref('')

async function add(kind: 'make' | 'model' | 'feature') {
  error.value = ''
  try {
    if (kind === 'make' && newMake.value.trim()) {
      await $fetch('/api/admin/lookups', {
        method: 'POST',
        body: { kind, name: newMake.value.trim() },
      })
      newMake.value = ''
    } else if (kind === 'model' && newModel.value.trim() && selectedMakeId.value) {
      await $fetch('/api/admin/lookups', {
        method: 'POST',
        body: { kind, makeId: selectedMakeId.value, name: newModel.value.trim() },
      })
      newModel.value = ''
    } else if (kind === 'feature' && newFeature.value.trim()) {
      await $fetch('/api/admin/lookups', {
        method: 'POST',
        body: { kind, code: newFeature.value.trim() },
      })
      newFeature.value = ''
    }
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    error.value = err.data?.statusMessage ?? 'Eroare.'
  }
}

async function remove(kind: 'makes' | 'models' | 'features', id: number) {
  error.value = ''
  try {
    await $fetch(`/api/admin/lookups/${kind}/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    error.value = err.data?.statusMessage ?? 'Nu poate fi șters.'
  }
}

const inputClass =
  'w-full rounded-[8px] border border-neutral-100 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none'
</script>

<template>
  <div>
    <h1 class="text-2xl font-extrabold">Mărci, modele & dotări</h1>
    <p v-if="error" class="mt-3 rounded-[8px] bg-primary-light px-4 py-3 text-sm font-medium text-primary">
      {{ error }}
    </p>

    <div class="mt-6 grid gap-6 lg:grid-cols-3">
      <!-- Makes -->
      <div class="card p-5">
        <h2 class="font-bold">Mărci</h2>
        <form class="mt-3 flex gap-2" @submit.prevent="add('make')">
          <input v-model="newMake" :class="inputClass" placeholder="ex: Porsche" />
          <button type="submit" class="btn-primary !px-3 !py-2 text-sm">+</button>
        </form>
        <ul class="mt-3 divide-y divide-neutral-100">
          <li
            v-for="make in lookups?.makes ?? []"
            :key="make.id"
            class="flex cursor-pointer items-center justify-between py-2 text-sm"
            :class="make.id === selectedMakeId ? 'font-bold text-primary' : ''"
            @click="selectedMakeId = make.id"
          >
            <span>{{ make.name }} <span class="text-xs text-neutral-500">({{ make.models.length }})</span></span>
            <button class="text-neutral-500 hover:text-primary" @click.stop="remove('makes', make.id)">✕</button>
          </li>
        </ul>
      </div>

      <!-- Models of selected make -->
      <div class="card p-5">
        <h2 class="font-bold">
          Modele <span v-if="selectedMake" class="text-primary">— {{ selectedMake.name }}</span>
        </h2>
        <p v-if="!selectedMake" class="mt-3 text-sm text-neutral-500">Selectează o marcă din stânga.</p>
        <template v-else>
          <form class="mt-3 flex gap-2" @submit.prevent="add('model')">
            <input v-model="newModel" :class="inputClass" placeholder="ex: Cayenne" />
            <button type="submit" class="btn-primary !px-3 !py-2 text-sm">+</button>
          </form>
          <ul class="mt-3 divide-y divide-neutral-100">
            <li
              v-for="model in selectedMake.models"
              :key="model.id"
              class="flex items-center justify-between py-2 text-sm"
            >
              {{ model.name }}
              <button class="text-neutral-500 hover:text-primary" @click="remove('models', model.id)">✕</button>
            </li>
          </ul>
        </template>
      </div>

      <!-- Features -->
      <div class="card p-5">
        <h2 class="font-bold">Dotări</h2>
        <form class="mt-3 flex gap-2" @submit.prevent="add('feature')">
          <input v-model="newFeature" :class="inputClass" placeholder="ex: apple_carplay" />
          <button type="submit" class="btn-primary !px-3 !py-2 text-sm">+</button>
        </form>
        <ul class="mt-3 divide-y divide-neutral-100">
          <li
            v-for="feature in lookups?.features ?? []"
            :key="feature.id"
            class="flex items-center justify-between py-2 font-mono text-sm"
          >
            {{ feature.code }}
            <button class="text-neutral-500 hover:text-primary" @click="remove('features', feature.id)">✕</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
