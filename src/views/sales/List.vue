/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import DataTable from '@/components/DataTable.vue'
import EmptyState from '@/components/EmptyState.vue'
import CreateModal from '@/components/CreateModal.vue'

type SaleType = 'SMALL' | 'LARGE'

interface ProductPricing {
  id: number
  product: { id: number; name: string }
  saleType: SaleType
  price: number
}

interface Sale {
  id: number
  product: { id: number; name: string }
  quantity: number
  type: SaleType
  price: number
  total: number
  date: string
  seller: string
  invoiceUrl: string
  client: { id: number; name: string; phone: string; email: string; address: string }
}

const createModal = ref<InstanceType<typeof CreateModal>>()
const sales = ref<Sale[]>([])
const products = ref<{ id: number; name: string }[]>([])
const clients = ref<{ id: number; name: string }[]>([])
const pricings = ref<ProductPricing[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchProducts = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/products')
    if (!response.ok) throw new Error('Failed to fetch products')
    products.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const fetchClients = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/clients')
    if (!response.ok) throw new Error('Failed to fetch clients')
    clients.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const fetchPricings = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/pricings')
    if (!response.ok) throw new Error('Failed to fetch pricings')
    pricings.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const fetchSales = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/sales')
    if (!response.ok) throw new Error('Failed to fetch sales')
    sales.value = await response.json()
    console.log(sales.value)
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
  { header: 'Type', key: 'type' },
  { header: 'Price', key: 'price' },
  { header: 'Total', key: 'total' },
  { header: 'Date', key: 'date' },
  { header: 'Seller', key: 'seller' },
  { header: 'Client', key: 'client.name' },
  { header: 'Actions', key: 'actions' },
]

const buildInvoiceUrl = (invoicePath: string) => {
  if (!invoicePath) return ''

  if (invoicePath.startsWith('http://') || invoicePath.startsWith('https://')) {
    return invoicePath
  }

  const cleaned = invoicePath.replace(/^\/+/, '')

  if (cleaned.startsWith('invoices/')) {
    return `http://localhost:8080/${cleaned}`
  }

  return `http://localhost:8080/invoices/${cleaned}`
}

const viewInvoice = (sale: Sale) => {
  if (!sale.invoiceUrl) return
  window.open(buildInvoiceUrl(sale.invoiceUrl), '_blank', 'noopener,noreferrer')
}

const actions = [
  {
    label: 'Voir facture',
    action: (item: Sale) => viewInvoice(item),
    class:
      'inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 transition-colors hover:border-amber-300 hover:bg-amber-100',
    isVisible: (item: Sale) => Boolean(item.invoiceUrl),
  },
]

const getSaleTypesForProduct = (selectedProductId: number): SaleType[] => {
  return [
    ...new Set(
      pricings.value
        .filter((pricing) => pricing.product.id === selectedProductId)
        .map((pricing) => pricing.saleType),
    ),
  ]
}

const saleTypeLabel: Record<SaleType, string> = {
  SMALL: 'Small',
  LARGE: 'Large',
}

const saleCreationWarning = (form: Record<string, unknown>) => {
  const selectedProductId = Number(form.productId)
  if (!selectedProductId) return null

  const selectedProduct = products.value.find((product) => product.id === selectedProductId)
  const availableTypes = getSaleTypesForProduct(selectedProductId)

  if (availableTypes.length > 0) return null

  return `Vous ne pouvez pas enregistrer de vente pour ${selectedProduct?.name ?? 'ce produit'} car aucun prix n'est configure. Configurez d'abord un pricing.`
}

const salesCreateFields = computed(() => [
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
    key: 'quantity',
    label: 'Quantity',
    type: 'number',
    required: true,
    valueType: 'number' as const,
  },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    required: true,
    placeholder: 'Select sale type',
    options: (form: Record<string, unknown>) => {
      const selectedProductId = Number(form.productId)
      if (!selectedProductId) return []

      return getSaleTypesForProduct(selectedProductId).map((saleType) => ({
        label: saleTypeLabel[saleType],
        value: saleType,
      }))
    },
  },
  {
    key: 'seller',
    label: 'Seller',
    type: 'text',
    required: true,
  },
  {
    key: 'clientId',
    label: 'Client',
    type: 'select',
    required: true,
    valueType: 'number' as const,
    placeholder: 'Select client',
    options: clients.value.map((client) => ({ label: client.name, value: client.id })),
  },
])

const validateSaleCreation = (form: Record<string, unknown>) => {
  const selectedProductId = Number(form.productId)
  const selectedType = String(form.type || '')

  if (!selectedProductId) {
    return 'Veuillez selectionner un produit.'
  }

  const availableTypes = getSaleTypesForProduct(selectedProductId)

  if (!availableTypes.length) {
    return "Impossible d'enregistrer la vente: aucun prix n'est configure pour ce produit."
  }

  if (!selectedType || !availableTypes.includes(selectedType as SaleType)) {
    return 'Veuillez selectionner un type de vente configure pour ce produit.'
  }

  return null
}

const handleCreate = () => {
  createModal.value?.open()
}

const handleCreated = (newSale: unknown) => {
  sales.value.unshift(newSale as Sale)
}

onMounted(() => {
  fetchSales()
  fetchProducts()
  fetchClients()
  fetchPricings()
})
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
    <EmptyState
      v-else-if="!loading"
      message="No sales found."
      action-label="Create Sale"
      :on-action="handleCreate"
    />
    <CreateModal
      ref="createModal"
      entity-name="Sale"
      api-endpoint="sales"
      :fields="salesCreateFields"
      :validate="validateSaleCreation"
      :warning="saleCreationWarning"
      @created="handleCreated"
    />
  </div>
</template>
