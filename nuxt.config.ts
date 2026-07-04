import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@nuxtjs/i18n', 'nuxt-auth-utils'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  i18n: {
    defaultLocale: 'ro',
    strategy: 'prefix_except_default',
    // Enables absolute hreflang/canonical alternate links via useLocaleHead
    baseUrl: 'https://swisscars.md',
    locales: [
      { code: 'ro', language: 'ro-RO', name: 'Română', file: 'ro.json' },
      { code: 'ru', language: 'ru-RU', name: 'Русский', file: 'ru.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'sc_locale',
      redirectOn: 'root',
    },
  },

  runtimeConfig: {
    // Overridden by NUXT_* env vars
    r2AccountId: '',
    r2AccessKeyId: '',
    r2SecretAccessKey: '',
    r2Bucket: 'swisscars-photos',
    public: {
      siteUrl: 'https://swisscars.md',
      imageBaseUrl: '',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ro' },
      titleTemplate: '%s · Swiss Cars',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&display=swap',
        },
      ],
    },
  },
})
