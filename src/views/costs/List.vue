/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import CreateModal from '@/components/CreateModal.vue'
import EmptyState from '@/components/EmptyState.vue'

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

interface CostCategory {
  id: number
  name: string
  costType: 'FIXED' | 'VARIABLE'
  defaultAmount: number | null
}

const router = useRouter()
const createModal = ref<InstanceType<typeof CreateModal>>()
const costs = ref<Cost[]>([])
const categories = ref<CostCategory[]>([])
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

const fetchCategories = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/cost-categories')
    if (!response.ok) throw new Error('Failed to fetch categories')
    categories.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
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
    class: 'text-amber-600 hover:text-amber-700',
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

const handleCreated = (newCost: unknown) => {
  costs.value.push(newCost as Cost)
}

const categoryOptions = computed(() =>
  categories.value.map((category) => ({
    label: category.name,
    value: category.id,
  })),
)

const validateCostForm = (form: Record<string, unknown>) => {
  const selectedCategoryId = Number(form.categoryId)
  if (!selectedCategoryId || Number.isNaN(selectedCategoryId)) {
    return 'Veuillez choisir une categorie de cout.'
  }

  const selectedCategory = categories.value.find((category) => category.id === selectedCategoryId)
  if (!selectedCategory) {
    return 'Categorie de cout invalide.'
  }

  if (selectedCategory.costType === 'VARIABLE') {
    const rawAmount = String(form.amount ?? '').trim()
    if (!rawAmount) {
      return 'Le montant est obligatoire pour une categorie variable.'
    }
  }

  return null
}

const buildCostPayload = (form: Record<string, unknown>) => {
  const selectedCategoryId = Number(form.categoryId)
  const selectedCategory = categories.value.find((category) => category.id === selectedCategoryId)
  const rawAmount = String(form.amount ?? '').trim()

  const payload: Record<string, unknown> = {
    categoryId: selectedCategoryId,
    date: String(form.date ?? ''),
    notes: String(form.notes ?? ''),
  }

  if (selectedCategory?.costType === 'VARIABLE') {
    payload.amount = Number(rawAmount)
  } else if (
    selectedCategory?.defaultAmount !== null &&
    selectedCategory?.defaultAmount !== undefined
  ) {
    payload.amount = selectedCategory.defaultAmount
  }

  return payload
}

const isAmountFieldVisible = (form: Record<string, unknown>) => {
  const selectedCategoryId = Number(form.categoryId)
  const selectedCategory = categories.value.find((category) => category.id === selectedCategoryId)
  return selectedCategory?.costType === 'VARIABLE'
}

const costFields = computed(() => [
  {
    key: 'categoryId',
    label: 'Category',
    type: 'select',
    required: true,
    options: categoryOptions.value,
  },
  {
    key: 'amount',
    label: 'Amount (variable only)',
    type: 'number',
    required: false,
    placeholder: 'Leave empty for fixed categories',
    isVisible: isAmountFieldVisible,
  },
  { key: 'date', label: 'Date', type: 'datetime-local', required: true },
  { key: 'notes', label: 'Notes', type: 'text', required: false },
])

onMounted(() => {
  fetchCosts()
  fetchCategories()
})
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
    <EmptyState
      v-else-if="!loading"
      message="No costs found."
      action-label="Create Cost"
      :on-action="handleCreate"
    />
    <CreateModal
      ref="createModal"
      entity-name="Cost"
      api-endpoint="costs"
      :fields="costFields"
      :validate="validateCostForm"
      :payload-builder="buildCostPayload"
      @created="handleCreated"
    />
  </div>
</template>
