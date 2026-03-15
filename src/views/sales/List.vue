/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import CreateModal from '@/components/CreateModal.vue'

interface Sale {
  id: number
  product: { id: number; name: string }
  quantity: number
  type: 'SMALL' | 'LARGE'
  price: number
  total: number
  date: string
  seller: string
  invoiceUrl: string
  client: { id: number; name: string; phone: string; email: string; address: string }
}

const router = useRouter()
const createModal = ref<InstanceType<typeof CreateModal>>()
const sales = ref<Sale[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchSales = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/sales')
    if (!response.ok) throw new Error('Failed to fetch sales')
    sales.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const deleteSale = async (id: number) => {
  if (!confirm('Are you sure you want to delete this sale?')) return
  try {
    const response = await fetch(`http://localhost:8080/api/sales/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete sale')
    sales.value = sales.value.filter((s) => s.id !== id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const columns = [
  { header: 'ID', key: 'id' },
  { header: 'Product', key: 'product.name' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Type', key: 'type' },
  { header: 'Price', key: 'price' },
  { header: 'Total', key: 'total' },
  { header: 'Date', key: 'date' },
  { header: 'Seller', key: 'seller' },
  { header: 'Client', key: 'client.name' },
  { header: 'Invoice', key: 'invoiceUrl' },
]

const actions = [
  {
    label: 'Edit',
    action: (item: Sale) => {
      router.push(`/sales/edit/${item.id}`)
    },
    class: 'text-blue-500 hover:text-blue-700',
  },
  {
    label: 'Delete',
    action: (item: Sale) => deleteSale(item.id),
    class: 'text-red-500 hover:text-red-700',
  },
]

const handleCreate = () => {
  createModal.value?.open()
}

const handleCreated = (newSale: Sale) => {
  sales.value.push(newSale)
}

onMounted(fetchSales)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Sales</h1>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <DataTable
      v-if="sales.length"
      :data="sales"
      :columns="columns"
      :actions="actions"
      search-placeholder="Search sales..."
      :show-checkbox="true"
      :on-refresh="fetchSales"
      :on-create="handleCreate"
      create-label="Create Sale"
    />
    <div v-else-if="!loading">No sales found.</div>
    <CreateModal
      ref="createModal"
      entity-name="Sale"
      api-endpoint="sales"
      :fields="[
        { key: 'productId', label: 'Product ID', type: 'number', required: true },
        { key: 'quantity', label: 'Quantity', type: 'number', required: true },
        { key: 'type', label: 'Type', type: 'text', required: true, placeholder: 'SMALL or LARGE' },
        { key: 'price', label: 'Price', type: 'number', required: true },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'seller', label: 'Seller', type: 'text', required: true },
        { key: 'invoiceUrl', label: 'Invoice URL', type: 'text', required: false },
        { key: 'clientId', label: 'Client ID', type: 'number', required: true },
      ]"
      @created="handleCreated"
    />
  </div>
</template>
