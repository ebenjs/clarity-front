<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const pricingId = ref(Number(route.params.id))
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

const fetchPricing = async () => {
  loading.value = true
  try {
    const response = await fetch(`http://localhost:8080/api/pricings/${pricingId.value}`)
    if (!response.ok) throw new Error('Failed to fetch pricing')
    const pricing = await response.json()
    productId.value = pricing.product.id.toString()
    saleType.value = pricing.saleType
    price.value = pricing.price.toString()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const updatePricing = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`http://localhost:8080/api/pricings/${pricingId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: Number(productId.value),
        saleType: saleType.value,
        price: Number(price.value),
      }),
    })
    if (!response.ok) throw new Error('Failed to update pricing')
    router.push('/pricings')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
  fetchPricing()
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Edit Pricing</h1>
    <form @submit.prevent="updatePricing" class="space-y-4">
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
        <label for="saleType" class="block text-sm font-medium">Sale Type</label>
        <select
          v-model="saleType"
          id="saleType"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        >
          <option value="SMALL">Small</option>
          <option value="LARGE">Large</option>
        </select>
      </div>
      <div>
        <label for="price" class="block text-sm font-medium">Price</label>
        <input
          v-model="price"
          id="price"
          type="number"
          step="0.01"
          required
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <button type="submit" :disabled="loading" class="bg-blue-500 text-white px-4 py-2 rounded">
        {{ loading ? 'Updating...' : 'Update' }}
      </button>
      <router-link to="/pricings" class="ml-2 text-blue-500">Cancel</router-link>
    </form>
    <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>
  </div>
</template>
