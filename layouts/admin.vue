<script setup lang="ts">
const { user, clear } = useUserSession()
const menuOpen = ref(false)

useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const isAdmin = computed(() => user.value?.role === 'admin')

const links = computed(() => [
  { to: '/admin', label: 'Dashboard', exact: true },
  { to: '/admin/vehicles', label: 'Vehicule' },
  ...(isAdmin.value
    ? [
        { to: '/admin/sellers', label: 'Vânzători' },
        { to: '/admin/lookups', label: 'Mărci & dotări' },
        { to: '/admin/settings', label: 'Setări' },
      ]
    : []),
])

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  navigateTo('/admin/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-neutral-100">
    <!-- Sidebar (desktop) -->
    <aside class="hidden w-60 shrink-0 flex-col bg-charcoal text-white lg:flex">
      <div class="px-5 py-5 text-lg font-extrabold">
        Swiss<span class="text-primary">Cars</span>
        <span class="mt-0.5 block text-xs font-medium text-neutral-400">Panou de administrare</span>
      </div>
      <nav class="flex-1 space-y-1 px-3">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="block rounded-[8px] px-3 py-2.5 text-sm font-medium text-neutral-300 hover:bg-white/10 hover:text-white"
          active-class="!bg-primary !text-white"
          :exact-active-class="link.exact ? '!bg-primary !text-white' : undefined"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
      <div class="border-t border-white/10 px-5 py-4 text-sm">
        <p class="font-bold">{{ user?.name }}</p>
        <p class="text-xs text-neutral-400">{{ user?.email }}</p>
        <button class="mt-3 text-xs font-bold text-primary hover:underline" @click="logout">
          Deconectare
        </button>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Topbar (mobile) -->
      <header class="sticky top-0 z-30 flex h-14 items-center justify-between bg-charcoal px-4 text-white lg:hidden">
        <span class="font-extrabold">Swiss<span class="text-primary">Cars</span> Admin</span>
        <button class="text-2xl" aria-label="Menu" @click="menuOpen = !menuOpen">
          {{ menuOpen ? '✕' : '☰' }}
        </button>
      </header>
      <nav v-if="menuOpen" class="bg-charcoal px-4 pb-4 text-white lg:hidden">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="block py-2.5 text-sm font-medium"
          @click="menuOpen = false"
        >
          {{ link.label }}
        </NuxtLink>
        <button class="mt-2 text-xs font-bold text-primary" @click="logout">Deconectare</button>
      </nav>

      <main class="flex-1 p-4 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
