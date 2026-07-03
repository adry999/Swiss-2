<script setup lang="ts">
interface Photo {
  id: string
  url: string
  thumbnailUrl: string | null
  isPrimary: boolean
}

const props = defineProps<{ vehicleId: string; photos: Photo[] }>()
const emit = defineEmits<{ updated: [photos: Photo[]] }>()

const list = ref<Photo[]>([...props.photos])
watch(
  () => props.photos,
  (photos) => {
    list.value = [...photos]
  },
)

const uploading = ref(false)
const dragOver = ref(false)
const error = ref('')
const fileInput = ref<HTMLInputElement>()
const dragIndex = ref<number | null>(null)

async function reload() {
  const vehicle = await $fetch(`/api/admin/vehicles/${props.vehicleId}`)
  emit('updated', vehicle.photos as Photo[])
}

async function upload(files: FileList | File[]) {
  const images = Array.from(files).filter((f) => f.type.startsWith('image/'))
  if (!images.length) return
  error.value = ''
  uploading.value = true
  try {
    const body = new FormData()
    for (const file of images) body.append('photos', file)
    await $fetch(`/api/admin/vehicles/${props.vehicleId}/photos`, {
      method: 'POST',
      body,
    })
    await reload()
  } catch {
    error.value = 'Încărcarea a eșuat. Verifică formatul și dimensiunea (max 15 MB).'
  } finally {
    uploading.value = false
  }
}

function onDrop(event: DragEvent) {
  dragOver.value = false
  if (event.dataTransfer?.files?.length) upload(event.dataTransfer.files)
}

async function persistOrder(primaryId?: string) {
  await $fetch(`/api/admin/vehicles/${props.vehicleId}/photos`, {
    method: 'PATCH',
    body: {
      order: list.value.map((p) => p.id),
      ...(primaryId ? { primaryId } : {}),
    },
  })
  await reload()
}

function onPhotoDragStart(index: number) {
  dragIndex.value = index
}

async function onPhotoDrop(index: number) {
  if (dragIndex.value === null || dragIndex.value === index) return
  const moved = list.value.splice(dragIndex.value, 1)[0]
  list.value.splice(index, 0, moved)
  dragIndex.value = null
  await persistOrder()
}

async function setPrimary(id: string) {
  await persistOrder(id)
}

async function removePhoto(id: string) {
  if (!confirm('Ștergi această fotografie?')) return
  await $fetch(`/api/admin/photos/${id}`, { method: 'DELETE' })
  await reload()
}
</script>

<template>
  <div>
    <!-- Drop zone -->
    <div
      class="flex cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed px-4 py-8 text-center transition-colors"
      :class="dragOver ? 'border-primary bg-primary-light' : 'border-neutral-100 bg-neutral-100/50'"
      @click="fileInput?.click()"
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="onDrop"
    >
      <p class="font-bold">{{ uploading ? 'Se încarcă…' : 'Trage pozele aici sau apasă pentru a selecta' }}</p>
      <p class="mt-1 text-xs text-neutral-500">JPG / PNG / WebP, max 15 MB — convertite automat în WebP</p>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        @change="upload(($event.target as HTMLInputElement).files!); ($event.target as HTMLInputElement).value = ''"
      />
    </div>

    <p v-if="error" class="mt-2 text-sm font-medium text-primary">{{ error }}</p>

    <!-- Photo grid: drag to reorder, star = primary -->
    <div v-if="list.length" class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      <div
        v-for="(photo, index) in list"
        :key="photo.id"
        class="group relative cursor-grab overflow-hidden rounded-[8px] border-2"
        :class="photo.isPrimary ? 'border-primary' : 'border-transparent'"
        draggable="true"
        @dragstart="onPhotoDragStart(index)"
        @dragover.prevent
        @drop.prevent="onPhotoDrop(index)"
      >
        <img :src="photo.thumbnailUrl ?? photo.url" class="aspect-[4/3] w-full object-cover" alt="" />
        <span
          v-if="photo.isPrimary"
          class="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-white"
        >
          Principală
        </span>
        <div class="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            v-if="!photo.isPrimary"
            type="button"
            class="rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-bold"
            title="Setează ca principală"
            @click.stop="setPrimary(photo.id)"
          >
            ★
          </button>
          <span v-else />
          <button
            type="button"
            class="rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-bold text-primary"
            title="Șterge"
            @click.stop="removePhoto(photo.id)"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
