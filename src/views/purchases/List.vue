/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import CreateModal from '@/components/CreateModal.vue'

interface Purchase {
  id: number
  product: { id: number; name: string }
  quantity: number
  pricePerItem: number
  date: string
}

const router = useRouter()
const createModal = ref<InstanceType<typeof CreateModal>>()
const purchases = ref<Purchase[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchPurchases = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/purchases')
    if (!response.ok) throw new Error('Failed to fetch purchases')
    purchases.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const deletePurchase = async (id: number) => {
  if (!confirm('Are you sure you want to delete this purchase?')) return
  try {
    const response = await fetch(`http://localhost:8080/api/purchases/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete purchase')
    purchases.value = purchases.value.filter((p) => p.id !== id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const columns = [
  { header: 'ID', key: 'id' },
  { header: 'Product', key: 'product.name' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Price per Item', key: 'pricePerItem' },
  { header: 'Date', key: 'date' },
]

const actions = [
  {
    label: 'Edit',
    action: (item: Purchase) => {
      router.push(`/purchases/edit/${item.id}`)
    },
    class: 'text-blue-500 hover:text-blue-700',
  },
  {
    label: 'Delete',
    action: (item: Purchase) => deletePurchase(item.id),
    class: 'text-red-500 hover:text-red-700',
  },
]

const handleCreate = () => {
  createModal.value?.open()
}

const handleCreated = (newPurchase: Purchase) => {
  purchases.value.push(newPurchase)
}

onMounted(fetchPurchases)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Purchases</h1>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <DataTable
      v-if="purchases.length"
      :data="purchases"
      :columns="columns"
      :actions="actions"
      search-placeholder="Search purchases..."
      :show-checkbox="true"
      :on-refresh="fetchPurchases"
      :on-create="handleCreate"
      create-label="Create Purchase"
    />
    <div v-else-if="!loading">No purchases found.</div>
    <CreateModal
      ref="createModal"
      entity-name="Purchase"
      api-endpoint="purchases"
      :fields="[
        { key: 'productId', label: 'Product ID', type: 'number', required: true },
        { key: 'quantity', label: 'Quantity', type: 'number', required: true },
        { key: 'pricePerItem', label: 'Price per Item', type: 'number', required: true },
        { key: 'date', label: 'Date', type: 'date', required: true },
      ]"
      @created="handleCreated"
    />
  </div>
</template>
