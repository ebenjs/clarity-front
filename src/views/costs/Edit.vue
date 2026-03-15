<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const costId = ref(Number(route.params.id))
const categoryId = ref('')
const amount = ref('')
const date = ref('')
const notes = ref('')
const categories = ref<{ id: number; name: string }[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchCategories = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/cost-categories')
    if (!response.ok) throw new Error('Failed to fetch categories')
    categories.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const fetchCost = async () => {
  loading.value = true
  try {
    const response = await fetch(`http://localhost:8080/api/costs/${costId.value}`)
    if (!response.ok) throw new Error('Failed to fetch cost')
    const cost = await response.json()
    categoryId.value = cost.category.id.toString()
    amount.value = cost.amount.toString()
    date.value = cost.date.slice(0, 16) // for datetime-local
    notes.value = cost.notes
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const updateCost = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`http://localhost:8080/api/costs/${costId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId: Number(categoryId.value),
        amount: Number(amount.value),
        date: date.value,
        notes: notes.value,
      }),
    })
    if (!response.ok) throw new Error('Failed to update cost')
    router.push('/costs')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories()
  fetchCost()
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Edit Cost</h1>
    <form @submit.prevent="updateCost" class="space-y-4">
      <div>
        <label for="categoryId" class="block text-sm font-medium">Category</label>
        <select
          v-model="categoryId"
          id="categoryId"
          required
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        >
          <option value="">Select Category</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
      <div>
        <label for="amount" class="block text-sm font-medium">Amount</label>
        <input
          v-model="amount"
          id="amount"
          type="number"
          step="0.01"
          required
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label for="date" class="block text-sm font-medium">Date</label>
        <input
          v-model="date"
          id="date"
          type="datetime-local"
          required
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label for="notes" class="block text-sm font-medium">Notes</label>
        <textarea
          v-model="notes"
          id="notes"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        ></textarea>
      </div>
      <button type="submit" :disabled="loading" class="bg-blue-500 text-white px-4 py-2 rounded">
        {{ loading ? 'Updating...' : 'Update' }}
      </button>
      <router-link to="/costs" class="ml-2 text-blue-500">Cancel</router-link>
    </form>
    <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>
  </div>
</template>
