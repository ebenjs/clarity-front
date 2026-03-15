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
}

const config = ref<CompanyConfig | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const fetchConfig = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/company-config')
    if (!response.ok) throw new Error('Failed to fetch config')
    config.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const updateConfig = async () => {
  if (!config.value) return
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/company-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config.value),
    })
    if (!response.ok) throw new Error('Failed to update config')
    // Optionally refetch or just show success
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const setConfig = async () => {
  if (!config.value) return
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/company-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config.value),
    })
    if (!response.ok) throw new Error('Failed to set config')
    // Refetch
    await fetchConfig()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(fetchConfig)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Company Configuration</h1>
    <button @click="fetchConfig" class="bg-blue-500 text-white px-4 py-2 rounded mb-4">
      Refresh
    </button>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <form v-if="config" @submit.prevent="updateConfig" class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium">Name</label>
        <input
          v-model="config.name"
          id="name"
          type="text"
          required
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label for="address" class="block text-sm font-medium">Address</label>
        <textarea
          v-model="config.address"
          id="address"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        ></textarea>
      </div>
      <div>
        <label for="phone" class="block text-sm font-medium">Phone</label>
        <input
          v-model="config.phone"
          id="phone"
          type="text"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label for="email" class="block text-sm font-medium">Email</label>
        <input
          v-model="config.email"
          id="email"
          type="email"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label for="website" class="block text-sm font-medium">Website</label>
        <input
          v-model="config.website"
          id="website"
          type="url"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label for="logoUrl" class="block text-sm font-medium">Logo URL</label>
        <input
          v-model="config.logoUrl"
          id="logoUrl"
          type="url"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <button type="submit" :disabled="loading" class="bg-blue-500 text-white px-4 py-2 rounded">
        {{ loading ? 'Updating...' : 'Update' }}
      </button>
      <button
        type="button"
        @click="setConfig"
        :disabled="loading"
        class="bg-green-500 text-white px-4 py-2 rounded ml-2"
      >
        Set Config
      </button>
    </form>
  </div>
</template>
