<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const productId = ref(Number(route.params.id))
const name = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const fetchProduct = async () => {
  loading.value = true
  try {
    const response = await fetch(`http://localhost:8080/api/products/${productId.value}`)
    if (!response.ok) throw new Error('Failed to fetch product')
    const product = await response.json()
    name.value = product.name
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const updateProduct = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`http://localhost:8080/api/products/${productId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value }),
    })
    if (!response.ok) throw new Error('Failed to update product')
    router.push('/products')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(fetchProduct)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Edit Product</h1>
    <form @submit.prevent="updateProduct" class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium">Name</label>
        <input
          v-model="name"
          id="name"
          type="text"
          required
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <button type="submit" :disabled="loading" class="bg-amber-600 text-white px-4 py-2 rounded">
        {{ loading ? 'Updating...' : 'Update' }}
      </button>
      <router-link to="/products" class="ml-2 text-amber-600">Cancel</router-link>
    </form>
    <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>
  </div>
</template>
