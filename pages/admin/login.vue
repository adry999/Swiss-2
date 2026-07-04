<script setup lang="ts">
definePageMeta({ layout: false })
useHead({
  title: 'Autentificare',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const { loggedIn, fetch: refreshSession } = useUserSession()
if (loggedIn.value) {
  await navigateTo('/admin')
}

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    await refreshSession()
    navigateTo('/admin')
  } catch {
    error.value = 'Email sau parolă incorecte'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
    <form class="card w-full max-w-sm p-8" @submit.prevent="submit">
      <p class="text-center text-2xl font-extrabold">
        Swiss<span class="text-primary">Cars</span>
      </p>
      <p class="mt-1 text-center text-sm text-neutral-500">Panou de administrare</p>

      <label class="mt-6 block text-sm font-bold">Email</label>
      <input
        v-model="email"
        type="email"
        required
        autocomplete="username"
        class="mt-1 w-full rounded-[8px] border border-neutral-100 bg-neutral-100 px-3 py-2.5 focus:border-primary focus:outline-none"
      />

      <label class="mt-4 block text-sm font-bold">Parolă</label>
      <input
        v-model="password"
        type="password"
        required
        autocomplete="current-password"
        class="mt-1 w-full rounded-[8px] border border-neutral-100 bg-neutral-100 px-3 py-2.5 focus:border-primary focus:outline-none"
      />

      <p v-if="error" class="mt-3 text-sm font-medium text-primary">{{ error }}</p>

      <button type="submit" class="btn-primary mt-6 w-full" :disabled="loading">
        {{ loading ? 'Se conectează…' : 'Conectare' }}
      </button>
    </form>
  </div>
</template>
