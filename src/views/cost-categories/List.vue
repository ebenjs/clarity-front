/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import CreateModal from '@/components/CreateModal.vue'
import EmptyState from '@/components/EmptyState.vue'

interface CostCategory {
  id: number
  name: string
  costType: 'FIXED' | 'VARIABLE'
  defaultAmount: number
  description: string
}

const router = useRouter()
const createModal = ref<InstanceType<typeof CreateModal>>()
const categories = ref<CostCategory[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchCategories = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/cost-categories')
    if (!response.ok) throw new Error('Failed to fetch categories')
    categories.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const deleteCategory = async (id: number) => {
  if (!confirm('Are you sure you want to delete this category?')) return
  try {
    const response = await fetch(`http://localhost:8080/api/cost-categories/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete category')
    categories.value = categories.value.filter((c) => c.id !== id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const columns = [
  { header: 'ID', key: 'id' },
  { header: 'Name', key: 'name' },
  { header: 'Type', key: 'costType' },
  { header: 'Default Amount', key: 'defaultAmount' },
  { header: 'Description', key: 'description' },
]

const actions = [
  {
    label: 'Edit',
    action: (item: CostCategory) => {
      router.push(`/cost-categories/edit/${item.id}`)
    },
    class: 'text-blue-500 hover:text-blue-700',
  },
  {
    label: 'Delete',
    action: (item: CostCategory) => deleteCategory(item.id),
    class: 'text-red-500 hover:text-red-700',
  },
]

const handleCreate = () => {
  createModal.value?.open()
}

const handleCreated = (newCategory: unknown) => {
  categories.value.push(newCategory as CostCategory)
}

onMounted(fetchCategories)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Cost Categories</h1>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <DataTable
      v-if="categories.length"
      :data="categories"
      :columns="columns"
      :actions="actions"
      search-placeholder="Search categories..."
      :show-checkbox="true"
      :on-refresh="fetchCategories"
      :on-create="handleCreate"
      create-label="Create Category"
    />
    <EmptyState
      v-else-if="!loading"
      message="No categories found."
      action-label="Create Category"
      :on-action="handleCreate"
    />
    <CreateModal
      ref="createModal"
      entity-name="Category"
      api-endpoint="cost-categories"
      :fields="[
        { key: 'name', label: 'Name', type: 'text', required: true },
        {
          key: 'costType',
          label: 'Cost Type',
          type: 'text',
          required: true,
          placeholder: 'FIXED or VARIABLE',
        },
        { key: 'defaultAmount', label: 'Default Amount', type: 'number', required: true },
        { key: 'description', label: 'Description', type: 'text', required: false },
      ]"
      @created="handleCreated"
    />
  </div>
</template>
