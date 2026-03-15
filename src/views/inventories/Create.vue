/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const productId = ref('')
const countedQuantity = ref('')
const performedBy = ref('')
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

const createInventory = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/inventories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: Number(productId.value),
        countedQuantity: Number(countedQuantity.value),
        performedBy: performedBy.value,
      }),
    })
    if (!response.ok) throw new Error('Failed to create inventory')
    router.push('/inventories')
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
    <h1 class="text-2xl font-bold mb-4">Create Inventory</h1>
    <form @submit.prevent="createInventory" class="max-w-md mx-auto space-y-6">
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
        <label for="countedQuantity" class="block mb-2.5 text-sm font-medium text-heading"
          >Counted Quantity</label
        >
        <input
          v-model="countedQuantity"
          id="countedQuantity"
          type="number"
          required
          class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
          placeholder="Enter quantity"
        />
      </div>
      <div class="mb-6">
        <label for="performedBy" class="block mb-2.5 text-sm font-medium text-heading"
          >Performed By</label
        >
        <input
          v-model="performedBy"
          id="performedBy"
          type="text"
          required
          class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
          placeholder="Enter performer name"
        />
      </div>
      <div class="flex space-x-4">
        <button
          type="submit"
          :disabled="loading"
          class="bg-green-500 text-white px-4 py-2 rounded-base hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          {{ loading ? 'Creating...' : 'Create Inventory' }}
        </button>
        <router-link
          to="/inventories"
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
