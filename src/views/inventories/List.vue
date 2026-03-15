/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import CreateModal from '@/components/CreateModal.vue'

interface Inventory {
  id: number
  product: { id: number; name: string }
  countedQuantity: number
  date: string
  performedBy: string
}

const router = useRouter()
const createModal = ref<InstanceType<typeof CreateModal>>()
const inventories = ref<Inventory[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchInventories = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/inventories')
    if (!response.ok) throw new Error('Failed to fetch inventories')
    inventories.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const deleteInventory = async (id: number) => {
  if (!confirm('Are you sure you want to delete this inventory?')) return
  try {
    const response = await fetch(`http://localhost:8080/api/inventories/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete inventory')
    inventories.value = inventories.value.filter((i) => i.id !== id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const columns = [
  { header: 'ID', key: 'id' },
  { header: 'Product', key: 'product.name' },
  { header: 'Counted Quantity', key: 'countedQuantity' },
  { header: 'Date', key: 'date' },
  { header: 'Performed By', key: 'performedBy' },
]

const actions = [
  {
    label: 'Edit',
    action: (item: Inventory) => {
      router.push(`/inventories/edit/${item.id}`)
    },
    class: 'text-blue-500 hover:text-blue-700',
  },
  {
    label: 'Delete',
    action: (item: Inventory) => deleteInventory(item.id),
    class: 'text-red-500 hover:text-red-700',
  },
]

const handleCreate = () => {
  createModal.value?.open()
}

const handleCreated = (newInventory: Inventory) => {
  inventories.value.push(newInventory)
}

onMounted(fetchInventories)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Inventories</h1>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <DataTable
      v-if="inventories.length"
      :data="inventories"
      :columns="columns"
      :actions="actions"
      search-placeholder="Search inventories..."
      :show-checkbox="true"
      :on-refresh="fetchInventories"
      :on-create="handleCreate"
      create-label="Create Inventory"
    />
    <div v-else-if="!loading">No inventories found.</div>
    <CreateModal
      ref="createModal"
      entity-name="Inventory"
      api-endpoint="inventories"
      :fields="[
        { key: 'productId', label: 'Product ID', type: 'number', required: true },
        { key: 'countedQuantity', label: 'Counted Quantity', type: 'number', required: true },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'performedBy', label: 'Performed By', type: 'text', required: true },
      ]"
      @created="handleCreated"
    />
  </div>
</template>
