<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Setări' })

interface LeasingPartner {
  name: string
  logo: string
  terms: string
}

const { data } = await useFetch('/api/admin/settings')

const company = reactive({
  name: 'Swiss Cars',
  address: '',
  phones: [''] as string[],
  email: '',
  workingHours: '',
  socials: { facebook: '', instagram: '', tiktok: '' },
  whatsapp: '',
  ...((data.value?.company as object) ?? {}),
})
const financing = reactive({
  annualInterestRate: 9.5,
  minTermMonths: 12,
  maxTermMonths: 72,
  minDownPaymentPct: 20,
  ...((data.value?.financing_calculator as object) ?? {}),
})
const seo = reactive({
  titleTemplate: '%s · Swiss Cars',
  description: '',
  ...((data.value?.seo_defaults as object) ?? {}),
})
const analytics = reactive({
  gtagId: '',
  metaPixelId: '',
  ...((data.value?.analytics as object) ?? {}),
})
const leasingPartners = ref<LeasingPartner[]>(
  (data.value?.leasing_partners as LeasingPartner[]) ?? [],
)

const saving = ref(false)
const saved = ref(false)
const error = ref('')

async function save() {
  saving.value = true
  saved.value = false
  error.value = ''
  try {
    await $fetch('/api/admin/settings', {
      method: 'PUT',
      body: {
        company: { ...company, phones: company.phones.filter(Boolean) },
        financing_calculator: { ...financing },
        seo_defaults: { ...seo },
        analytics: { ...analytics },
        leasing_partners: leasingPartners.value.filter((p) => p.name),
      },
    })
    saved.value = true
  } catch {
    error.value = 'Eroare la salvare.'
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
      <h1 class="text-2xl font-extrabold">Setări</h1>
      <div class="flex items-center gap-3">
        <span v-if="saved" class="text-sm font-bold text-green-600">✓ Salvat</span>
        <span v-if="error" class="text-sm font-bold text-primary">{{ error }}</span>
        <button type="submit" class="btn-primary !py-2 text-sm" :disabled="saving">
          {{ saving ? 'Se salvează…' : 'Salvează' }}
        </button>
      </div>
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-2">
      <div class="card p-5">
        <h2 class="font-bold">Companie</h2>
        <label class="mt-4 block text-sm font-medium">
          Denumire
          <input v-model="company.name" :class="inputClass" />
        </label>
        <label class="mt-3 block text-sm font-medium">
          Adresă
          <input v-model="company.address" :class="inputClass" />
        </label>
        <label class="mt-3 block text-sm font-medium">
          Email
          <input v-model="company.email" type="email" :class="inputClass" />
        </label>
        <div class="mt-3 text-sm font-medium">
          Telefoane
          <div v-for="(_, i) in company.phones" :key="i" class="mt-1 flex gap-2">
            <input v-model="company.phones[i]" :class="inputClass" class="!mt-0" placeholder="+373 …" />
            <button
              type="button"
              class="shrink-0 text-neutral-500 hover:text-primary"
              @click="company.phones.splice(i, 1)"
            >
              ✕
            </button>
          </div>
          <button type="button" class="mt-2 text-xs font-bold text-primary" @click="company.phones.push('')">
            + Adaugă telefon
          </button>
        </div>
        <label class="mt-3 block text-sm font-medium">
          WhatsApp (buton plutitor)
          <input v-model="company.whatsapp" :class="inputClass" placeholder="+373 …" />
        </label>
        <label class="mt-3 block text-sm font-medium">
          Program de lucru
          <input v-model="company.workingHours" :class="inputClass" placeholder="Lun–Vin 9:00–18:00, Sâm 10:00–14:00" />
        </label>
        <div class="mt-3 grid grid-cols-3 gap-3">
          <label class="block text-sm font-medium">
            Facebook
            <input v-model="company.socials.facebook" :class="inputClass" />
          </label>
          <label class="block text-sm font-medium">
            Instagram
            <input v-model="company.socials.instagram" :class="inputClass" />
          </label>
          <label class="block text-sm font-medium">
            TikTok
            <input v-model="company.socials.tiktok" :class="inputClass" />
          </label>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card p-5">
          <h2 class="font-bold">Calculator finanțare</h2>
          <div class="mt-4 grid grid-cols-2 gap-3">
            <label class="block text-sm font-medium">
              Dobândă anuală (%)
              <input v-model.number="financing.annualInterestRate" type="number" step="0.1" min="0" :class="inputClass" />
            </label>
            <label class="block text-sm font-medium">
              Avans minim (%)
              <input v-model.number="financing.minDownPaymentPct" type="number" min="0" max="90" :class="inputClass" />
            </label>
            <label class="block text-sm font-medium">
              Termen minim (luni)
              <input v-model.number="financing.minTermMonths" type="number" min="1" :class="inputClass" />
            </label>
            <label class="block text-sm font-medium">
              Termen maxim (luni)
              <input v-model.number="financing.maxTermMonths" type="number" min="1" :class="inputClass" />
            </label>
          </div>
        </div>

        <div class="card p-5">
          <h2 class="font-bold">SEO & Analytics</h2>
          <label class="mt-4 block text-sm font-medium">
            Șablon titlu meta
            <input v-model="seo.titleTemplate" :class="inputClass" />
          </label>
          <label class="mt-3 block text-sm font-medium">
            Descriere meta implicită
            <textarea v-model="seo.description" rows="2" :class="inputClass" />
          </label>
          <div class="mt-3 grid grid-cols-2 gap-3">
            <label class="block text-sm font-medium">
              Google Analytics ID
              <input v-model="analytics.gtagId" :class="inputClass" placeholder="G-…" />
            </label>
            <label class="block text-sm font-medium">
              Meta Pixel ID
              <input v-model="analytics.metaPixelId" :class="inputClass" />
            </label>
          </div>
        </div>

        <div class="card p-5">
          <h2 class="font-bold">Parteneri leasing</h2>
          <div v-for="(partner, i) in leasingPartners" :key="i" class="mt-3 rounded-[8px] bg-neutral-100 p-3">
            <div class="flex justify-between">
              <span class="text-xs font-bold uppercase text-neutral-500">Partener {{ i + 1 }}</span>
              <button type="button" class="text-xs text-neutral-500 hover:text-primary" @click="leasingPartners.splice(i, 1)">
                Șterge
              </button>
            </div>
            <input v-model="partner.name" :class="inputClass" placeholder="Nume" />
            <input v-model="partner.logo" :class="inputClass" placeholder="URL logo" />
            <input v-model="partner.terms" :class="inputClass" placeholder="Condiții (ex: avans de la 20%)" />
          </div>
          <button
            type="button"
            class="mt-3 text-xs font-bold text-primary"
            @click="leasingPartners.push({ name: '', logo: '', terms: '' })"
          >
            + Adaugă partener
          </button>
        </div>
      </div>
    </div>
  </form>
</template>
