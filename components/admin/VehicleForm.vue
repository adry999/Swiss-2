<script setup lang="ts">
const props = defineProps<{ vehicleId?: string }>()

const isEdit = computed(() => !!props.vehicleId)

const { data: lookups } = await useFetch('/api/admin/lookups')
const { data: sellers } = await useFetch('/api/admin/sellers')

interface FormState {
  makeId: number | null
  modelId: number | null
  year: number
  price: number | null
  priceType: 'fixed' | 'estimated'
  status: 'in_stock' | 'on_order' | 'reserved' | 'sold'
  mileageKm: number | null
  fuelType: string
  transmission: string
  drivetrain: string | null
  bodyType: string | null
  powerHp: number | null
  engineCc: number | null
  color: string | null
  originCountry: string
  vin: string | null
  description: string | null
  estimatedDeliveryDays: number | null
  isFeatured: boolean
  assignedSellerId: string | null
  featureIds: number[]
}

const form = reactive<FormState>({
  makeId: null,
  modelId: null,
  year: new Date().getFullYear(),
  price: null,
  priceType: 'fixed',
  status: 'in_stock',
  mileageKm: null,
  fuelType: 'diesel',
  transmission: 'automatic',
  drivetrain: null,
  bodyType: null,
  powerHp: null,
  engineCc: null,
  color: null,
  originCountry: 'Switzerland',
  vin: null,
  description: null,
  estimatedDeliveryDays: null,
  isFeatured: false,
  assignedSellerId: null,
  featureIds: [],
})

const photos = ref<
  Array<{ id: string; url: string; thumbnailUrl: string | null; isPrimary: boolean }>
>([])
const productCode = ref('')

if (props.vehicleId) {
  const vehicle = await $fetch(`/api/admin/vehicles/${props.vehicleId}`)
  Object.assign(form, {
    makeId: vehicle.makeId,
    modelId: vehicle.modelId,
    year: vehicle.year,
    price: vehicle.price,
    priceType: vehicle.priceType,
    status: vehicle.status,
    mileageKm: vehicle.mileageKm,
    fuelType: vehicle.fuelType,
    transmission: vehicle.transmission,
    drivetrain: vehicle.drivetrain,
    bodyType: vehicle.bodyType,
    powerHp: vehicle.powerHp,
    engineCc: vehicle.engineCc,
    color: vehicle.color,
    originCountry: vehicle.originCountry,
    vin: vehicle.vin,
    description: vehicle.description,
    estimatedDeliveryDays: vehicle.estimatedDeliveryDays,
    isFeatured: vehicle.isFeatured,
    assignedSellerId: vehicle.assignedSellerId,
    featureIds: vehicle.featureIds,
  })
  photos.value = vehicle.photos
  productCode.value = vehicle.productCode
}

const availableModels = computed(
  () => lookups.value?.makes.find((m) => m.id === form.makeId)?.models ?? [],
)

watch(
  () => form.makeId,
  () => {
    if (!availableModels.value.some((m) => m.id === form.modelId)) {
      form.modelId = null
    }
  },
)

const fuelOptions = [
  ['petrol', 'Benzină'],
  ['diesel', 'Diesel'],
  ['hybrid', 'Hibrid'],
  ['plugin_hybrid', 'Hibrid plug-in'],
  ['electric', 'Electric'],
  ['lpg', 'GPL'],
] as const
const transmissionOptions = [
  ['automatic', 'Automată'],
  ['manual', 'Manuală'],
] as const
const drivetrainOptions = [
  ['fwd', 'Tracțiune față'],
  ['rwd', 'Tracțiune spate'],
  ['awd', '4x4 / AWD'],
] as const
const bodyOptions = [
  ['sedan', 'Sedan'],
  ['hatchback', 'Hatchback'],
  ['wagon', 'Break'],
  ['suv', 'SUV'],
  ['crossover', 'Crossover'],
  ['coupe', 'Coupé'],
  ['cabriolet', 'Cabriolet'],
  ['minivan', 'Minivan'],
  ['pickup', 'Pickup'],
  ['van', 'Van'],
] as const
const statusOptions = [
  ['in_stock', 'În stoc'],
  ['on_order', 'La comandă'],
  ['reserved', 'Rezervat'],
  ['sold', 'Vândut'],
] as const

const featureLabels: Record<string, string> = {
  climate_control: 'Climatizare',
  leather_seats: 'Scaune din piele',
  navigation: 'Navigație',
  parking_sensors: 'Senzori de parcare',
  led_lights: 'Faruri LED',
  panoramic_roof: 'Trapă panoramică',
  heated_seats: 'Scaune încălzite',
  rear_camera: 'Cameră marșarier',
  cruise_control: 'Pilot automat',
  keyless_entry: 'Acces fără cheie',
}

const saving = ref(false)
const error = ref('')
const saved = ref(false)

async function save() {
  error.value = ''
  saved.value = false
  if (!form.makeId || !form.modelId) {
    error.value = 'Selectează marca și modelul.'
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await $fetch(`/api/admin/vehicles/${props.vehicleId}`, {
        method: 'PUT',
        body: form,
      })
      saved.value = true
    } else {
      const vehicle = await $fetch('/api/admin/vehicles', {
        method: 'POST',
        body: form,
      })
      navigateTo(`/admin/vehicles/${vehicle.id}`)
    }
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    error.value = err.data?.statusMessage ?? 'Eroare la salvare.'
  } finally {
    saving.value = false
  }
}

const inputClass =
  'mt-1 w-full rounded-[8px] border border-neutral-100 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none'
</script>

<template>
  <form @submit.prevent="save">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-extrabold">
          {{ isEdit ? 'Editează vehicul' : 'Vehicul nou' }}
        </h1>
        <p v-if="productCode" class="mt-1 font-mono text-xs text-neutral-500">
          Cod produs: {{ productCode }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="saved" class="text-sm font-bold text-green-600">✓ Salvat</span>
        <button type="submit" class="btn-primary !py-2 text-sm" :disabled="saving">
          {{ saving ? 'Se salvează…' : 'Salvează' }}
        </button>
      </div>
    </div>

    <p v-if="error" class="mt-3 rounded-[8px] bg-primary-light px-4 py-3 text-sm font-medium text-primary">
      {{ error }}
    </p>

    <div class="mt-6 grid gap-6 lg:grid-cols-3">
      <!-- Main info -->
      <div class="card p-5 lg:col-span-2">
        <h2 class="font-bold">Informații generale</h2>
        <div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <label class="block text-sm font-medium">
            Marcă *
            <select v-model.number="form.makeId" :class="inputClass" required>
              <option :value="null" disabled>Selectează</option>
              <option v-for="m in lookups?.makes ?? []" :key="m.id" :value="m.id">
                {{ m.name }}
              </option>
            </select>
          </label>
          <label class="block text-sm font-medium">
            Model *
            <select v-model.number="form.modelId" :class="inputClass" required :disabled="!form.makeId">
              <option :value="null" disabled>Selectează</option>
              <option v-for="m in availableModels" :key="m.id" :value="m.id">
                {{ m.name }}
              </option>
            </select>
          </label>
          <label class="block text-sm font-medium">
            An *
            <input v-model.number="form.year" type="number" min="1980" :max="new Date().getFullYear() + 1" :class="inputClass" required />
          </label>
          <label class="block text-sm font-medium">
            Rulaj (km)
            <input v-model.number="form.mileageKm" type="number" min="0" :class="inputClass" />
          </label>
          <label class="block text-sm font-medium">
            Combustibil *
            <select v-model="form.fuelType" :class="inputClass">
              <option v-for="[value, label] in fuelOptions" :key="value" :value="value">{{ label }}</option>
            </select>
          </label>
          <label class="block text-sm font-medium">
            Cutie de viteze *
            <select v-model="form.transmission" :class="inputClass">
              <option v-for="[value, label] in transmissionOptions" :key="value" :value="value">{{ label }}</option>
            </select>
          </label>
          <label class="block text-sm font-medium">
            Tracțiune
            <select v-model="form.drivetrain" :class="inputClass">
              <option :value="null">—</option>
              <option v-for="[value, label] in drivetrainOptions" :key="value" :value="value">{{ label }}</option>
            </select>
          </label>
          <label class="block text-sm font-medium">
            Caroserie
            <select v-model="form.bodyType" :class="inputClass">
              <option :value="null">—</option>
              <option v-for="[value, label] in bodyOptions" :key="value" :value="value">{{ label }}</option>
            </select>
          </label>
          <label class="block text-sm font-medium">
            Putere (CP)
            <input v-model.number="form.powerHp" type="number" min="1" :class="inputClass" />
          </label>
          <label class="block text-sm font-medium">
            Capacitate (cm³)
            <input v-model.number="form.engineCc" type="number" min="1" :class="inputClass" />
          </label>
          <label class="block text-sm font-medium">
            Culoare
            <input v-model="form.color" type="text" :class="inputClass" />
          </label>
          <label class="block text-sm font-medium">
            VIN
            <input v-model="form.vin" type="text" maxlength="17" :class="inputClass" />
          </label>
        </div>

        <label class="mt-4 block text-sm font-medium">
          Descriere
          <textarea v-model="form.description" rows="5" :class="inputClass" />
        </label>

        <h2 class="mt-6 font-bold">Dotări</h2>
        <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <label
            v-for="f in lookups?.features ?? []"
            :key="f.id"
            class="flex items-center gap-2 text-sm"
          >
            <input v-model="form.featureIds" type="checkbox" :value="f.id" class="accent-primary" />
            {{ featureLabels[f.code] ?? f.code }}
          </label>
        </div>
      </div>

      <!-- Side column: price, status, seller -->
      <div class="space-y-6">
        <div class="card p-5">
          <h2 class="font-bold">Preț & status</h2>
          <label class="mt-4 block text-sm font-medium">
            Status
            <select v-model="form.status" :class="inputClass">
              <option v-for="[value, label] in statusOptions" :key="value" :value="value">{{ label }}</option>
            </select>
          </label>
          <label class="mt-3 block text-sm font-medium">
            Tip preț
            <select v-model="form.priceType" :class="inputClass">
              <option value="fixed">Fix</option>
              <option value="estimated">Estimativ</option>
            </select>
          </label>
          <label class="mt-3 block text-sm font-medium">
            Preț (EUR)
            <input v-model.number="form.price" type="number" min="1" :class="inputClass" />
          </label>
          <label v-if="form.status === 'on_order'" class="mt-3 block text-sm font-medium">
            Livrare estimată (zile)
            <input v-model.number="form.estimatedDeliveryDays" type="number" min="1" :class="inputClass" />
          </label>
          <label class="mt-4 flex items-center gap-2 text-sm font-medium">
            <input v-model="form.isFeatured" type="checkbox" class="accent-primary" />
            Promovat pe pagina principală
          </label>
        </div>

        <div class="card p-5">
          <h2 class="font-bold">Vânzător asignat</h2>
          <select v-model="form.assignedSellerId" :class="inputClass" class="mt-3">
            <option :value="null">Neasignat</option>
            <option v-for="s in sellers ?? []" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Photos -->
    <div class="card mt-6 p-5">
      <h2 class="font-bold">Fotografii</h2>
      <AdminPhotoUploader
        v-if="isEdit"
        :vehicle-id="props.vehicleId!"
        :photos="photos"
        class="mt-4"
        @updated="photos = $event"
      />
      <p v-else class="mt-3 text-sm text-neutral-500">
        Salvează vehiculul mai întâi pentru a putea încărca fotografii.
      </p>
    </div>
  </form>
</template>
