/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
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

const createCost = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/costs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId: Number(categoryId.value),
        amount: Number(amount.value),
        date: date.value,
        notes: notes.value,
      }),
    })
    if (!response.ok) throw new Error('Failed to create cost')
    router.push('/costs')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(fetchCategories)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Create Cost</h1>
    <form @submit.prevent="createCost" class="max-w-md mx-auto space-y-6">
      <div class="mb-6">
        <label for="categoryId" class="block mb-2.5 text-sm font-medium text-heading"
          >Category</label
        >
        <select
          v-model="categoryId"
          id="categoryId"
          required
          class="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs"
        >
          <option value="">Select Category</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
      <div class="mb-6">
        <label for="amount" class="block mb-2.5 text-sm font-medium text-heading">Amount</label>
        <input
          v-model="amount"
          id="amount"
          type="number"
          step="0.01"
          required
          class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
          placeholder="Enter amount"
        />
      </div>
      <div class="mb-6">
        <label for="date" class="block mb-2.5 text-sm font-medium text-heading">Date</label>
        <input
          v-model="date"
          id="date"
          type="datetime-local"
          required
          class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs"
        />
      </div>
      <div class="mb-6">
        <label for="notes" class="block mb-2.5 text-sm font-medium text-heading">Notes</label>
        <textarea
          v-model="notes"
          id="notes"
          rows="4"
          class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full p-3.5 shadow-xs placeholder:text-body"
          placeholder="Enter notes..."
        ></textarea>
      </div>
      <div class="flex space-x-4">
        <button
          type="submit"
          :disabled="loading"
          class="bg-green-500 text-white px-4 py-2 rounded-base hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          {{ loading ? 'Creating...' : 'Create Cost' }}
        </button>
        <router-link
          to="/costs"
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
