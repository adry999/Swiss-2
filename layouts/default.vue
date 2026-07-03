<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { locale, locales, setLocale } = useI18n()

const menuOpen = ref(false)

const navLinks = computed(() => [
  { to: localePath('/'), label: t('nav.home') },
  { to: localePath('/stoc'), label: t('nav.stock') },
  { to: localePath('/comanda'), label: t('nav.order') },
  { to: localePath('/leasing'), label: t('nav.leasing') },
  { to: localePath('/despre'), label: t('nav.about') },
  { to: localePath('/contact'), label: t('nav.contact') },
])
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <!-- Sticky header -->
    <header class="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <NuxtLink :to="localePath('/')" class="text-xl font-extrabold">
          Swiss<span class="text-primary">Cars</span>
        </NuxtLink>

        <nav class="hidden items-center gap-6 lg:flex">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-sm font-medium text-neutral-900 hover:text-primary"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-3">
          <!-- Language toggle -->
          <div class="flex items-center gap-1 text-xs font-bold uppercase">
            <button
              v-for="l in locales"
              :key="l.code"
              class="rounded px-1.5 py-1"
              :class="l.code === locale ? 'bg-primary text-white' : 'text-neutral-500 hover:text-neutral-900'"
              @click="setLocale(l.code)"
            >
              {{ l.code }}
            </button>
          </div>

          <!-- Mobile menu button -->
          <button
            class="flex h-10 w-10 items-center justify-center rounded-[8px] lg:hidden"
            aria-label="Menu"
            @click="menuOpen = !menuOpen"
          >
            <span class="text-2xl leading-none">{{ menuOpen ? '✕' : '☰' }}</span>
          </button>
        </div>
      </div>

      <!-- Mobile nav -->
      <nav v-if="menuOpen" class="border-t border-neutral-100 bg-white px-4 py-3 lg:hidden">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="block py-2.5 font-medium"
          @click="menuOpen = false"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="bg-charcoal py-10 text-white">
      <div class="mx-auto max-w-7xl px-4">
        <p class="text-lg font-extrabold">Swiss<span class="text-primary">Cars</span></p>
        <p class="mt-2 text-sm text-neutral-400">{{ t('footer.tagline') }}</p>
      </div>
    </footer>

    <!-- Floating WhatsApp button (number filled from settings later) -->
    <a
      href="https://wa.me/"
      target="_blank"
      rel="noopener"
      class="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg"
      aria-label="WhatsApp"
    >
      <svg viewBox="0 0 24 24" class="h-7 w-7 fill-current" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.4A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2-1.2-.8-.7-1.3-1.5-1.4-1.8-.1-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.5 1 2.6c.1.2 1.8 2.7 4.3 3.8.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3z" />
      </svg>
    </a>
  </div>
</template>
