<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const productId = ref('')
const saleType = ref<'SMALL' | 'LARGE'>('SMALL')
const price = ref('')
const products = ref<{ id: number; name: string }[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchProducts = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/products')
    if (!response.ok) throw new Error('Failed to fetch products')
    products.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const createPricing = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/pricings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: Number(productId.value),
        saleType: saleType.value,
        price: Number(price.value),
      }),
    })
    if (!response.ok) throw new Error('Failed to create pricing')
    router.push('/pricings')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(fetchProducts)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Create Pricing</h1>
    <form @submit.prevent="createPricing" class="max-w-md mx-auto space-y-6">
      <div class="mb-6">
        <label for="productId" class="block mb-2.5 text-sm font-medium text-heading">Product</label>
        <select
          v-model="productId"
          id="productId"
          required
          class="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs"
        >
          <option value="">Select Product</option>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }}
          </option>
        </select>
      </div>
      <div class="mb-6">
        <label for="saleType" class="block mb-2.5 text-sm font-medium text-heading"
          >Sale Type</label
        >
        <select
          v-model="saleType"
          id="saleType"
          class="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs"
        >
          <option value="SMALL">Small</option>
          <option value="LARGE">Large</option>
        </select>
      </div>
      <div class="mb-6">
        <label for="price" class="block mb-2.5 text-sm font-medium text-heading">Price</label>
        <input
          v-model="price"
          id="price"
          type="number"
          step="0.01"
          required
          class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
          placeholder="Enter price"
        />
      </div>
      <div class="flex space-x-4">
        <button
          type="submit"
          :disabled="loading"
          class="bg-green-500 text-white px-4 py-2 rounded-base hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          {{ loading ? 'Creating...' : 'Create Pricing' }}
        </button>
        <router-link
          to="/pricings"
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
