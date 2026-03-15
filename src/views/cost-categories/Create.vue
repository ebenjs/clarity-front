/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const costType = ref<'FIXED' | 'VARIABLE'>('FIXED')
const defaultAmount = ref('')
const description = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const createCategory = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/cost-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        costType: costType.value,
        defaultAmount: Number(defaultAmount.value),
        description: description.value,
      }),
    })
    if (!response.ok) throw new Error('Failed to create category')
    router.push('/cost-categories')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Create Cost Category</h1>
    <form @submit.prevent="createCategory" class="max-w-md mx-auto space-y-6">
      <div class="mb-6">
        <label for="name" class="block mb-2.5 text-sm font-medium text-heading"
          >Category Name</label
        >
        <input
          v-model="name"
          id="name"
          type="text"
          required
          class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
          placeholder="Enter category name"
        />
      </div>
      <div class="mb-6">
        <label for="costType" class="block mb-2.5 text-sm font-medium text-heading"
          >Cost Type</label
        >
        <select
          v-model="costType"
          id="costType"
          class="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs"
        >
          <option value="FIXED">Fixed</option>
          <option value="VARIABLE">Variable</option>
        </select>
      </div>
      <div class="mb-6">
        <label for="defaultAmount" class="block mb-2.5 text-sm font-medium text-heading"
          >Default Amount</label
        >
        <input
          v-model="defaultAmount"
          id="defaultAmount"
          type="number"
          step="0.01"
          required
          class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
          placeholder="Enter default amount"
        />
      </div>
      <div class="mb-6">
        <label for="description" class="block mb-2.5 text-sm font-medium text-heading"
          >Description</label
        >
        <textarea
          v-model="description"
          id="description"
          rows="4"
          class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full p-3.5 shadow-xs placeholder:text-body"
          placeholder="Enter description..."
        ></textarea>
      </div>
      <div class="flex space-x-4">
        <button
          type="submit"
          :disabled="loading"
          class="bg-green-500 text-white px-4 py-2 rounded-base hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          {{ loading ? 'Creating...' : 'Create Category' }}
        </button>
        <router-link
          to="/cost-categories"
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
