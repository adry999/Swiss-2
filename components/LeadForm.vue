<script setup lang="ts">
const props = defineProps<{
  type: 'order_request' | 'contact' | 'financing' | 'callback'
  vehicleId?: string | null
  showBudget?: boolean
  showLinks?: boolean
  showMessage?: boolean
  messageLabel?: string
}>()

const { t } = useI18n()

const form = reactive({
  name: '',
  phone: '',
  email: '',
  message: '',
  budget: null as number | null,
  referenceLinks: '',
  website: '', // honeypot
})

const state = ref<'idle' | 'sending' | 'success' | 'error'>('idle')

async function submit() {
  state.value = 'sending'
  try {
    await $fetch('/api/leads', {
      method: 'POST',
      body: {
        type: props.type,
        vehicleId: props.vehicleId ?? null,
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        message: form.message || null,
        budget: form.budget,
        referenceLinks: form.referenceLinks || null,
        website: form.website,
      },
    })
    state.value = 'success'
  } catch {
    state.value = 'error'
  }
}

const inputClass =
  'mt-1 w-full rounded-[8px] border border-neutral-100 bg-neutral-100 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none'
</script>

<template>
  <div>
    <p v-if="state === 'success'" class="rounded-[8px] bg-green-50 px-4 py-3 font-medium text-green-700">
      {{ t('form.success') }}
    </p>
    <form v-else @submit.prevent="submit">
      <label class="block text-sm font-bold">
        {{ t('form.name') }} *
        <input v-model="form.name" required minlength="2" :class="inputClass" />
      </label>
      <label class="mt-3 block text-sm font-bold">
        {{ t('form.phone') }} *
        <input v-model="form.phone" type="tel" required minlength="5" :class="inputClass" placeholder="+373 …" />
      </label>
      <label class="mt-3 block text-sm font-bold">
        {{ t('form.email') }}
        <input v-model="form.email" type="email" :class="inputClass" />
      </label>
      <label v-if="showBudget" class="mt-3 block text-sm font-bold">
        {{ t('form.budget') }}
        <input v-model.number="form.budget" type="number" min="1" :class="inputClass" />
      </label>
      <label v-if="showMessage !== false" class="mt-3 block text-sm font-bold">
        {{ messageLabel ?? t('form.message') }}
        <textarea v-model="form.message" rows="3" :class="inputClass" />
      </label>
      <label v-if="showLinks" class="mt-3 block text-sm font-bold">
        {{ t('form.links') }}
        <textarea v-model="form.referenceLinks" rows="2" :class="inputClass" placeholder="https://…" />
      </label>
      <!-- Honeypot -->
      <input
        v-model="form.website"
        type="text"
        name="website"
        tabindex="-1"
        autocomplete="off"
        aria-hidden="true"
        class="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <p v-if="state === 'error'" class="mt-3 text-sm font-medium text-primary">
        {{ t('form.error') }}
      </p>

      <button type="submit" class="btn-primary mt-4 w-full" :disabled="state === 'sending'">
        {{ state === 'sending' ? t('form.sending') : t('form.send') }}
      </button>
    </form>
  </div>
</template>
