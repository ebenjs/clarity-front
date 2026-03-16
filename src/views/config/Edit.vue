<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface CompanyConfig {
  id: number
  name: string
  address: string
  phone: string
  email: string
  website: string
  logoUrl: string
  currency: string
}

const defaultConfig: CompanyConfig = {
  id: 0,
  name: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  logoUrl: '',
  currency: 'XAF',
}

const config = ref<CompanyConfig>({ ...defaultConfig })
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const mode = ref<'create' | 'update'>('create')

const readErrorMessage = async (response: Response, fallback: string) => {
  try {
    const data = await response.json()
    if (typeof data?.message === 'string') return data.message
  } catch {
    // Ignore parse issues and use fallback
  }
  return fallback
}

const fetchConfig = async () => {
  loading.value = true
  error.value = null
  success.value = null
  try {
    const response = await fetch('http://localhost:8080/api/company-config')

    if (response.status === 404) {
      config.value = { ...defaultConfig }
      mode.value = 'create'
      return
    }

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'Failed to fetch config'))
    }

    const data = (await response.json()) as CompanyConfig
    config.value = {
      ...defaultConfig,
      ...data,
    }
    mode.value = config.value.id ? 'update' : 'create'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  loading.value = true
  error.value = null
  success.value = null

  const endpoint = 'http://localhost:8080/api/company-config'
  const method = mode.value === 'update' ? 'PUT' : 'POST'

  try {
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config.value),
    })

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, 'Failed to save config'))
    }

    const data = (await response.json()) as CompanyConfig
    config.value = {
      ...defaultConfig,
      ...data,
    }
    mode.value = config.value.id ? 'update' : mode.value
    success.value = mode.value === 'update' ? 'Configuration updated.' : 'Configuration created.'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  error.value = null
  success.value = null
  config.value = { ...defaultConfig }
  mode.value = 'create'
}

onMounted(fetchConfig)
</script>

<template>
  <div class="min-h-full bg-white rounded-2xl p-6 lg:p-8">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Company Configuration</h1>
        <p class="mt-1 text-sm text-slate-600">
          Update identity, contact details, website and default currency used by the backend.
        </p>
      </div>
      <div
        class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
        :class="
          mode === 'update' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        "
      >
        {{ mode === 'update' ? 'Existing config' : 'No config yet' }}
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <form
        @submit.prevent="saveConfig"
        class="xl:col-span-8 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur-sm"
      >
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="md:col-span-2">
            <label for="name" class="mb-1 block text-sm font-medium text-slate-700"
              >Company name</label
            >
            <input
              id="name"
              v-model="config.name"
              type="text"
              required
              class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              placeholder="Ex: Clarity SARL"
            />
          </div>

          <div class="md:col-span-2">
            <label for="address" class="mb-1 block text-sm font-medium text-slate-700"
              >Address</label
            >
            <textarea
              id="address"
              v-model="config.address"
              rows="3"
              class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              placeholder="Street, city, country"
            ></textarea>
          </div>

          <div>
            <label for="phone" class="mb-1 block text-sm font-medium text-slate-700">Phone</label>
            <input
              id="phone"
              v-model="config.phone"
              type="text"
              class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              placeholder="+237 6xx xx xx xx"
            />
          </div>

          <div>
            <label for="email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              id="email"
              v-model="config.email"
              type="email"
              class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              placeholder="contact@company.com"
            />
          </div>

          <div>
            <label for="website" class="mb-1 block text-sm font-medium text-slate-700"
              >Website</label
            >
            <input
              id="website"
              v-model="config.website"
              type="text"
              class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              placeholder="Any text or URL accepted"
            />
          </div>

          <div>
            <label for="currency" class="mb-1 block text-sm font-medium text-slate-700"
              >Currency</label
            >
            <input
              id="currency"
              v-model="config.currency"
              type="text"
              class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              placeholder="XAF, EUR, USD"
            />
          </div>

          <div class="md:col-span-2">
            <label for="logoUrl" class="mb-1 block text-sm font-medium text-slate-700"
              >Logo URL</label
            >
            <input
              id="logoUrl"
              v-model="config.logoUrl"
              type="text"
              class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              placeholder="https://..."
            />
          </div>
        </div>

        <div class="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            @click="fetchConfig"
            :disabled="loading"
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            Refresh
          </button>
          <button
            type="button"
            @click="resetForm"
            :disabled="loading"
            class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 shadow-sm hover:bg-amber-100 disabled:opacity-60"
          >
            Reset
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 disabled:opacity-60"
          >
            {{
              loading
                ? 'Saving...'
                : mode === 'update'
                  ? 'Update configuration'
                  : 'Create configuration'
            }}
          </button>
        </div>
      </form>

      <div
        class="xl:col-span-4 rounded-2xl border border-slate-200 bg-slate-900 p-5 text-slate-100 shadow-sm"
      >
        <h2 class="text-sm font-semibold uppercase tracking-wide text-cyan-300">Live preview</h2>
        <p class="mt-3 text-2xl font-bold">{{ config.name || 'Company name' }}</p>
        <p class="mt-2 text-sm text-slate-300">{{ config.address || 'Address not set' }}</p>
        <div class="mt-4 space-y-2 text-sm text-slate-200">
          <p><span class="text-slate-400">Phone:</span> {{ config.phone || '-' }}</p>
          <p><span class="text-slate-400">Email:</span> {{ config.email || '-' }}</p>
          <p><span class="text-slate-400">Website:</span> {{ config.website || '-' }}</p>
          <p><span class="text-slate-400">Currency:</span> {{ config.currency || '-' }}</p>
        </div>
        <div
          v-if="config.logoUrl"
          class="mt-4 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300 break-words"
        >
          Logo URL: {{ config.logoUrl }}
        </div>
      </div>
    </div>

    <div
      v-if="error"
      class="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
    >
      {{ error }}
    </div>
    <div
      v-if="success"
      class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
    >
      {{ success }}
    </div>
  </div>
</template>
