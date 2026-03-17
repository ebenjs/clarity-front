<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const createProduct = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value }),
    })
    if (!response.ok) throw new Error('Failed to create product')
    router.push('/products')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Create Product</h1>
    <form @submit.prevent="createProduct" class="max-w-md mx-auto space-y-6">
      <div class="mb-6">
        <label for="name" class="block mb-2.5 text-sm font-medium text-heading">Product Name</label>
        <input
          v-model="name"
          id="name"
          type="text"
          required
          class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
          placeholder="Enter product name"
        />
      </div>
      <div class="flex space-x-4">
        <button
          type="submit"
          :disabled="loading"
          class="bg-amber-600 text-white px-4 py-2 rounded-base hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
        >
          {{ loading ? 'Creating...' : 'Create Product' }}
        </button>
        <router-link
          to="/products"
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
