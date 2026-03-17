<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const categoryId = ref(Number(route.params.id))
const name = ref('')
const costType = ref<'FIXED' | 'VARIABLE'>('FIXED')
const defaultAmount = ref('')
const description = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const fetchCategory = async () => {
  loading.value = true
  try {
    const response = await fetch(`http://localhost:8080/api/cost-categories/${categoryId.value}`)
    if (!response.ok) throw new Error('Failed to fetch category')
    const category = await response.json()
    name.value = category.name
    costType.value = category.costType
    defaultAmount.value = category.defaultAmount.toString()
    description.value = category.description
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const updateCategory = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`http://localhost:8080/api/cost-categories/${categoryId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        costType: costType.value,
        defaultAmount: Number(defaultAmount.value),
        description: description.value,
      }),
    })
    if (!response.ok) throw new Error('Failed to update category')
    router.push('/cost-categories')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(fetchCategory)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Edit Cost Category</h1>
    <form @submit.prevent="updateCategory" class="space-y-4">
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
      <div>
        <label for="costType" class="block text-sm font-medium">Cost Type</label>
        <select
          v-model="costType"
          id="costType"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        >
          <option value="FIXED">Fixed</option>
          <option value="VARIABLE">Variable</option>
        </select>
      </div>
      <div>
        <label for="defaultAmount" class="block text-sm font-medium">Default Amount</label>
        <input
          v-model="defaultAmount"
          id="defaultAmount"
          type="number"
          step="0.01"
          required
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label for="description" class="block text-sm font-medium">Description</label>
        <textarea
          v-model="description"
          id="description"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        ></textarea>
      </div>
      <button type="submit" :disabled="loading" class="bg-amber-600 text-white px-4 py-2 rounded">
        {{ loading ? 'Updating...' : 'Update' }}
      </button>
      <router-link to="/cost-categories" class="ml-2 text-amber-600">Cancel</router-link>
    </form>
    <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>
  </div>
</template>
