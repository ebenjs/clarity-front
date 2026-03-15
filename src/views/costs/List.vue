/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import CreateModal from '@/components/CreateModal.vue'

interface Cost {
  id: number
  category: {
    id: number
    name: string
    costType: string
    defaultAmount: number
    description: string
  }
  amount: number
  date: string
  notes: string
}

const router = useRouter()
const createModal = ref<InstanceType<typeof CreateModal>>()
const costs = ref<Cost[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchCosts = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/costs')
    if (!response.ok) throw new Error('Failed to fetch costs')
    costs.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const deleteCost = async (id: number) => {
  if (!confirm('Are you sure you want to delete this cost?')) return
  try {
    const response = await fetch(`http://localhost:8080/api/costs/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete cost')
    costs.value = costs.value.filter((c) => c.id !== id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const columns = [
  { header: 'ID', key: 'id' },
  { header: 'Category', key: 'category.name' },
  { header: 'Amount', key: 'amount' },
  { header: 'Date', key: 'date' },
  { header: 'Notes', key: 'notes' },
]

const actions = [
  {
    label: 'Edit',
    action: (item: Cost) => {
      router.push(`/costs/edit/${item.id}`)
    },
    class: 'text-blue-500 hover:text-blue-700',
  },
  {
    label: 'Delete',
    action: (item: Cost) => deleteCost(item.id),
    class: 'text-red-500 hover:text-red-700',
  },
]

const handleCreate = () => {
  createModal.value?.open()
}

const handleCreated = (newCost: Cost) => {
  costs.value.push(newCost)
}

onMounted(fetchCosts)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Costs</h1>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <DataTable
      v-if="costs.length"
      :data="costs"
      :columns="columns"
      :actions="actions"
      search-placeholder="Search costs..."
      :show-checkbox="true"
      :on-refresh="fetchCosts"
      :on-create="handleCreate"
      create-label="Create Cost"
    />
    <div v-else-if="!loading">No costs found.</div>
    <CreateModal
      ref="createModal"
      entity-name="Cost"
      api-endpoint="costs"
      :fields="[
        { key: 'categoryId', label: 'Category ID', type: 'number', required: true },
        { key: 'amount', label: 'Amount', type: 'number', required: true },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'notes', label: 'Notes', type: 'text', required: false },
      ]"
      @created="handleCreated"
    />
  </div>
</template>
