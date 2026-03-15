<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from '@/components/DataTable.vue'
import CreateModal from '@/components/CreateModal.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const createModal = ref<InstanceType<typeof CreateModal>>()

interface Product {
  id: number
  name: string
}

const products = ref<Product[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const columns = [
  { header: 'ID', key: 'id' },
  { header: 'Name', key: 'name' },
  { header: 'Actions', key: 'actions' },
]

const actions = [
  {
    label: 'Edit',
    action: (item: Product) => router.push(`/products/edit/${item.id}`),
    class: 'font-medium text-blue-500 hover:underline',
  },
  {
    label: 'Delete',
    action: (item: Product) => deleteProduct(item.id),
    class: 'font-medium text-red-500 hover:underline',
  },
]

const fetchProducts = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/products')
    if (!response.ok) throw new Error('Failed to fetch products')
    products.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const deleteProduct = async (id: number) => {
  if (!confirm('Are you sure you want to delete this product?')) return
  try {
    const response = await fetch(`http://localhost:8080/api/products/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete product')
    products.value = products.value.filter((p) => p.id !== id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const handleCreate = () => {
  createModal.value?.open()
}

const handleCreated = (newProduct: Product) => {
  products.value.push(newProduct)
}

onMounted(fetchProducts)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Products</h1>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>
    <DataTable
      :columns="columns"
      :data="products"
      :actions="actions"
      :show-checkbox="true"
      search-placeholder="Search products..."
      :on-refresh="fetchProducts"
      :on-create="handleCreate"
      create-label="Create Product"
    />
    <CreateModal
      ref="createModal"
      entity-name="Product"
      api-endpoint="products"
      :fields="[{ key: 'name', label: 'Name', type: 'text', required: true }]"
      @created="handleCreated"
    />
  </div>
</template>
