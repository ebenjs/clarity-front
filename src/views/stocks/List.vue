/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from '@/components/DataTable.vue'
import EmptyState from '@/components/EmptyState.vue'

interface Stock {
  id: number
  product: { id: number; name: string }
  quantity: number
}

const stocks = ref<Stock[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchStocks = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/stocks')
    if (!response.ok) throw new Error('Failed to fetch stocks')
    stocks.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const columns = [
  { header: 'ID', key: 'id' },
  { header: 'Product', key: 'product.name' },
  { header: 'Quantity', key: 'quantity' },
]

onMounted(fetchStocks)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Stocks</h1>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <DataTable
      v-if="stocks.length"
      :data="stocks"
      :columns="columns"
      search-placeholder="Search stocks..."
      :show-checkbox="false"
      :on-refresh="fetchStocks"
    />
    <EmptyState v-else-if="!loading" message="No stocks found." />
  </div>
</template>
