/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const phone = ref('')
const email = ref('')
const address = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const createClient = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        phone: phone.value,
        email: email.value,
        address: address.value,
      }),
    })
    if (!response.ok) throw new Error('Failed to create client')
    router.push('/clients')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Create Client</h1>
    <form @submit.prevent="createClient" class="max-w-md mx-auto space-y-6">
      <div class="mb-6">
        <label for="name" class="block mb-2.5 text-sm font-medium text-heading">Client Name</label>
        <input
          v-model="name"
          id="name"
          type="text"
          required
          class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
          placeholder="Enter client name"
        />
      </div>
      <div class="mb-6">
        <label for="phone" class="block mb-2.5 text-sm font-medium text-heading">Phone</label>
        <input
          v-model="phone"
          id="phone"
          type="text"
          class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
          placeholder="Enter phone number"
        />
      </div>
      <div class="mb-6">
        <label for="email" class="block mb-2.5 text-sm font-medium text-heading">Email</label>
        <input
          v-model="email"
          id="email"
          type="email"
          class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
          placeholder="Enter email address"
        />
      </div>
      <div class="mb-6">
        <label for="address" class="block mb-2.5 text-sm font-medium text-heading">Address</label>
        <textarea
          v-model="address"
          id="address"
          rows="4"
          class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full p-3.5 shadow-xs placeholder:text-body"
          placeholder="Enter address..."
        ></textarea>
      </div>
      <div class="flex space-x-4">
        <button
          type="submit"
          :disabled="loading"
          class="bg-amber-600 text-white px-4 py-2 rounded-base hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
        >
          {{ loading ? 'Creating...' : 'Create Client' }}
        </button>
        <router-link
          to="/clients"
          class="bg-gray-500 text-white px-4 py-2 rounded-base hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 inline-block text-center"
        >
          Cancel
        </router-link>
      </div>
    </form>
    <div
      v-if="error"
      class="mt-4 text-sm text-fg-danger-strong bg-danger-soft border border-danger-subtle rounded-base p-3"
    >
      <span class="font-medium">Error:</span> {{ error }}
    </div>
  </div>
</template>
