/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from '@/components/DataTable.vue'
import CreateModal from '@/components/CreateModal.vue'

interface Stock {
  id: number
  product: { id: number; name: string }
  quantity: number
}

const createModal = ref<InstanceType<typeof CreateModal>>()
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

const handleCreate = () => {
  createModal.value?.open()
}

const handleCreated = (newStock: Stock) => {
  stocks.value.push(newStock)
}

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
      :on-create="handleCreate"
      create-label="Create Stock"
    />
    <div v-else-if="!loading">No stocks found.</div>
    <CreateModal
      ref="createModal"
      entity-name="Stock"
      api-endpoint="stocks"
      :fields="[
        { key: 'productId', label: 'Product ID', type: 'number', required: true },
        { key: 'quantity', label: 'Quantity', type: 'number', required: true },
      ]"
      @created="handleCreated"
    />
  </div>
</template>
