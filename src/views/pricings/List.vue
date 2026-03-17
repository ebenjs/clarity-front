/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import CreateModal from '@/components/CreateModal.vue'
import EmptyState from '@/components/EmptyState.vue'

interface ProductPricing {
  id: number
  product: { id: number; name: string }
  saleType: 'SMALL' | 'LARGE'
  price: number
}

const router = useRouter()
const createModal = ref<InstanceType<typeof CreateModal>>()
const pricings = ref<ProductPricing[]>([])
const products = ref<{ id: number; name: string }[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const pricingCreateFields = computed(() => [
  {
    key: 'productId',
    label: 'Product',
    type: 'select',
    required: true,
    valueType: 'number' as const,
    placeholder: 'Select product',
    options: products.value.map((product) => ({ label: product.name, value: product.id })),
  },
  {
    key: 'saleType',
    label: 'Sale Type',
    type: 'select',
    required: true,
    placeholder: 'Select sale type',
    options: [
      { label: 'Small', value: 'SMALL' },
      { label: 'Large', value: 'LARGE' },
    ],
  },
  {
    key: 'price',
    label: 'Price',
    type: 'number',
    required: true,
    valueType: 'number' as const,
  },
])

const fetchProducts = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/products')
    if (!response.ok) throw new Error('Failed to fetch products')
    products.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const fetchPricings = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/pricings')
    if (!response.ok) throw new Error('Failed to fetch pricings')
    pricings.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const deletePricing = async (id: number) => {
  if (!confirm('Are you sure you want to delete this pricing?')) return
  try {
    const response = await fetch(`http://localhost:8080/api/pricings/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete pricing')
    pricings.value = pricings.value.filter((p) => p.id !== id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const columns = [
  { header: 'ID', key: 'id' },
  { header: 'Product', key: 'product.name' },
  { header: 'Sale Type', key: 'saleType' },
  { header: 'Price', key: 'price' },
]

const actions = [
  {
    label: 'Edit',
    action: (item: ProductPricing) => {
      router.push(`/pricings/edit/${item.id}`)
    },
    class: 'text-amber-600 hover:text-amber-700',
  },
  {
    label: 'Delete',
    action: (item: ProductPricing) => deletePricing(item.id),
    class: 'text-red-500 hover:text-red-700',
  },
]

const handleCreate = () => {
  createModal.value?.open()
}

const handleCreated = (newPricing: unknown) => {
  pricings.value.push(newPricing as ProductPricing)
}

onMounted(fetchPricings)
onMounted(fetchProducts)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Pricings</h1>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <DataTable
      v-if="pricings.length"
      :data="pricings"
      :columns="columns"
      :actions="actions"
      search-placeholder="Search pricings..."
      :show-checkbox="true"
      :on-refresh="fetchPricings"
      :on-create="handleCreate"
      create-label="Create Pricing"
    />
    <EmptyState
      v-else-if="!loading"
      message="No pricings found."
      action-label="Create Pricing"
      :on-action="handleCreate"
    />
    <CreateModal
      ref="createModal"
      entity-name="Pricing"
      api-endpoint="pricings"
      :fields="pricingCreateFields"
      @created="handleCreated"
    />
  </div>
</template>
