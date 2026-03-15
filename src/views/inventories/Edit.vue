<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const inventoryId = ref(Number(route.params.id))
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

const fetchInventory = async () => {
  loading.value = true
  try {
    const response = await fetch(`http://localhost:8080/api/inventories/${inventoryId.value}`)
    if (!response.ok) throw new Error('Failed to fetch inventory')
    const inventory = await response.json()
    productId.value = inventory.product.id.toString()
    countedQuantity.value = inventory.countedQuantity.toString()
    performedBy.value = inventory.performedBy
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const updateInventory = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`http://localhost:8080/api/inventories/${inventoryId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: Number(productId.value),
        countedQuantity: Number(countedQuantity.value),
        performedBy: performedBy.value,
      }),
    })
    if (!response.ok) throw new Error('Failed to update inventory')
    router.push('/inventories')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
  fetchInventory()
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Edit Inventory</h1>
    <form @submit.prevent="updateInventory" class="space-y-4">
      <div>
        <label for="productId" class="block text-sm font-medium">Product</label>
        <select
          v-model="productId"
          id="productId"
          required
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        >
          <option value="">Select Product</option>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }}
          </option>
        </select>
      </div>
      <div>
        <label for="countedQuantity" class="block text-sm font-medium">Counted Quantity</label>
        <input
          v-model="countedQuantity"
          id="countedQuantity"
          type="number"
          required
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label for="performedBy" class="block text-sm font-medium">Performed By</label>
        <input
          v-model="performedBy"
          id="performedBy"
          type="text"
          required
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <button type="submit" :disabled="loading" class="bg-blue-500 text-white px-4 py-2 rounded">
        {{ loading ? 'Updating...' : 'Update' }}
      </button>
      <router-link to="/inventories" class="ml-2 text-blue-500">Cancel</router-link>
    </form>
    <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>
  </div>
</template>
