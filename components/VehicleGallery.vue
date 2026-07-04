<script setup lang="ts">
interface Photo {
  id: string
  url: string
  thumbnailUrl: string | null
}

const props = defineProps<{ photos: Photo[]; alt: string }>()

const current = ref(0)
const lightbox = ref(false)

const hasPhotos = computed(() => props.photos.length > 0)

function prev() {
  current.value = (current.value - 1 + props.photos.length) % props.photos.length
}
function next() {
  current.value = (current.value + 1) % props.photos.length
}

function onKeydown(event: KeyboardEvent) {
  if (!lightbox.value) return
  if (event.key === 'Escape') lightbox.value = false
  if (event.key === 'ArrowLeft') prev()
  if (event.key === 'ArrowRight') next()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div>
    <div
      class="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-neutral-100"
      :class="hasPhotos ? 'cursor-zoom-in' : ''"
      @click="hasPhotos && (lightbox = true)"
    >
      <img
        v-if="hasPhotos"
        :src="photos[current].url"
        :alt="alt"
        class="h-full w-full object-cover"
      />
      <div v-else class="flex h-full items-center justify-center text-6xl text-neutral-500">🚗</div>

      <template v-if="photos.length > 1">
        <button
          class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow"
          aria-label="Previous"
          @click.stop="prev"
        >
          ‹
        </button>
        <button
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow"
          aria-label="Next"
          @click.stop="next"
        >
          ›
        </button>
        <span class="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
          {{ current + 1 }} / {{ photos.length }}
        </span>
      </template>
    </div>

    <!-- Thumbnails -->
    <div v-if="photos.length > 1" class="mt-2 flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="(photo, index) in photos"
        :key="photo.id"
        class="h-16 w-24 shrink-0 overflow-hidden rounded-[8px] border-2"
        :class="index === current ? 'border-primary' : 'border-transparent'"
        @click="current = index"
      >
        <img :src="photo.thumbnailUrl ?? photo.url" :alt="alt" class="h-full w-full object-cover" />
      </button>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <div
        v-if="lightbox"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
        @click.self="lightbox = false"
      >
        <button
          class="absolute right-4 top-4 text-3xl text-white"
          aria-label="Close"
          @click="lightbox = false"
        >
          ✕
        </button>
        <button
          v-if="photos.length > 1"
          class="absolute left-4 text-4xl text-white"
          aria-label="Previous"
          @click="prev"
        >
          ‹
        </button>
        <img :src="photos[current].url" :alt="alt" class="max-h-full max-w-full object-contain" />
        <button
          v-if="photos.length > 1"
          class="absolute right-4 text-4xl text-white"
          aria-label="Next"
          @click="next"
        >
          ›
        </button>
      </div>
    </Teleport>
  </div>
</template>
