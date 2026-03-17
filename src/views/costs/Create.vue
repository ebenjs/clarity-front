/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
type CostType = 'FIXED' | 'VARIABLE'

interface CostCategory {
  id: number
  name: string
  costType: CostType
  defaultAmount: number | null
}

const categoryName = ref('')
const amount = ref('')
const date = ref('')
const notes = ref('')
const categories = ref<CostCategory[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const selectedCategory = computed(() =>
  categories.value.find((category) => category.name === categoryName.value),
)

const isVariableCategory = computed(() => selectedCategory.value?.costType === 'VARIABLE')

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
  if (!categoryName.value) {
    error.value = 'Veuillez choisir une categorie de cout.'
    return
  }

  if (isVariableCategory.value && !amount.value) {
    error.value = 'Le montant est obligatoire pour une categorie variable.'
    return
  }

  loading.value = true
  error.value = null

  const selectedAmount = isVariableCategory.value
    ? Number(amount.value)
    : (selectedCategory.value?.defaultAmount ?? null)

  const payload: Record<string, unknown> = {
    categoryName: categoryName.value,
    date: date.value,
    notes: notes.value,
  }

  if (selectedAmount !== null && !Number.isNaN(selectedAmount)) {
    payload.amount = selectedAmount
  }

  try {
    const response = await fetch('http://localhost:8080/api/costs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
        <label for="categoryName" class="block mb-2.5 text-sm font-medium text-heading"
          >Category</label
        >
        <select
          v-model="categoryName"
          id="categoryName"
          required
          class="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs"
        >
          <option value="">Select Category</option>
          <option v-for="category in categories" :key="category.id" :value="category.name">
            {{ category.name }}
          </option>
        </select>
      </div>

      <div
        v-if="selectedCategory && selectedCategory.costType === 'FIXED'"
        class="mb-6 rounded-base border border-default bg-neutral-secondary-medium px-3 py-2.5"
      >
        <p class="text-sm text-body">
          Montant fixe applique:
          <span class="font-semibold text-heading">{{
            selectedCategory.defaultAmount ?? '-'
          }}</span>
        </p>
      </div>

      <div v-if="isVariableCategory" class="mb-6">
        <label for="amount" class="block mb-2.5 text-sm font-medium text-heading">Amount</label>
        <input
          v-model="amount"
          id="amount"
          type="number"
          step="0.01"
          required
          class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
          placeholder="Enter variable amount"
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
          class="bg-amber-600 text-white px-4 py-2 rounded-base hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
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
