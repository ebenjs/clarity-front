/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import EmptyState from '@/components/EmptyState.vue'

interface Purchase {
  id: number
  product: { id: number; name: string }
  quantity: number
  pricePerItem: number
  date: string
  status: 'PASSE' | 'LIVREE'
  paymentStatus: 'NON_PAYE' | 'PAYE'
}

const router = useRouter()
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

const getErrorMessage = async (response: Response, fallback: string) => {
  try {
    const data = await response.json()
    if (typeof data?.message === 'string') return data.message
  } catch {
    // Ignore JSON parse failures and use fallback message
  }
  return fallback
}

const columns = [
  { header: 'ID', key: 'id' },
  { header: 'Product', key: 'product.name' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Price per Item', key: 'pricePerItem' },
  { header: 'Status', key: 'status' },
  { header: 'Payment', key: 'paymentStatus' },
  { header: 'Date', key: 'date' },
]

const markAsDelivered = async (purchase: Purchase) => {
  if (purchase.status === 'LIVREE') return

  try {
    const response = await fetch(`http://localhost:8080/api/purchases/${purchase.id}/livrer`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to mark purchase as delivered'))
    }

    await fetchPurchases()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const setPaymentStatus = async (purchase: Purchase, status: 'NON_PAYE' | 'PAYE') => {
  if (purchase.paymentStatus === status) return

  try {
    const response = await fetch(
      `http://localhost:8080/api/purchases/${purchase.id}/paiement?status=${status}`,
      {
        method: 'POST',
      },
    )

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to update payment status'))
    }

    await fetchPurchases()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const actions = [
  {
    label: 'Mark Delivered',
    action: (item: Purchase) => markAsDelivered(item),
    class: 'text-blue-500 hover:text-blue-700 disabled:opacity-50',
    isVisible: (item: Purchase) => item.status !== 'LIVREE',
  },
  {
    label: 'Mark Paid',
    action: (item: Purchase) => setPaymentStatus(item, 'PAYE'),
    class: 'text-green-600 hover:text-green-700 disabled:opacity-50',
    isVisible: (item: Purchase) => item.paymentStatus !== 'PAYE',
  },
  {
    label: 'Mark Unpaid',
    action: (item: Purchase) => setPaymentStatus(item, 'NON_PAYE'),
    class: 'text-amber-600 hover:text-amber-700 disabled:opacity-50',
    isVisible: (item: Purchase) => item.paymentStatus !== 'NON_PAYE',
  },
]

const handleCreate = () => {
  router.push('/purchases/create')
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
    <EmptyState
      v-else-if="!loading"
      message="No purchases found."
      action-label="Create Purchase"
      :on-action="handleCreate"
    />
  </div>
</template>
