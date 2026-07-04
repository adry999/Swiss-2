import { defineStore } from 'pinia'

const MAX_FAVORITES = 50

// Cookie-persisted so SSR renders the correct hearts/count on first paint
export const useFavoritesStore = defineStore('favorites', () => {
  const cookie = useCookie<string[]>('sc_favorites', {
    default: () => [],
    maxAge: 60 * 60 * 24 * 180,
  })

  const ids = computed(() => cookie.value)
  const count = computed(() => cookie.value.length)

  function has(id: string) {
    return cookie.value.includes(id)
  }

  function toggle(id: string) {
    if (has(id)) {
      cookie.value = cookie.value.filter((x) => x !== id)
    } else {
      cookie.value = [...cookie.value, id].slice(-MAX_FAVORITES)
    }
  }

  return { ids, count, has, toggle }
})
