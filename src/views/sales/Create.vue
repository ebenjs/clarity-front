/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

type SaleType = 'SMALL' | 'LARGE'

interface ProductPricing {
  id: number
  product: { id: number; name: string }
  saleType: SaleType
  price: number
}

const router = useRouter()
const productId = ref('')
const quantity = ref('')
const type = ref<SaleType | ''>('')
const seller = ref('')
const clientId = ref('')
const products = ref<{ id: number; name: string }[]>([])
const clients = ref<{ id: number; name: string }[]>([])
const pricings = ref<ProductPricing[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const saleTypeLabel: Record<SaleType, string> = {
  SMALL: 'Small',
  LARGE: 'Large',
}

const availableSaleTypes = computed<SaleType[]>(() => {
  const selectedProductId = Number(productId.value)
  if (!selectedProductId) return []

  return [
    ...new Set(
      pricings.value
        .filter((pricing) => pricing.product.id === selectedProductId)
        .map((pricing) => pricing.saleType),
    ),
  ]
})

const selectedProductName = computed(() => {
  const selectedProductId = Number(productId.value)
  if (!selectedProductId) return ''
  return products.value.find((product) => product.id === selectedProductId)?.name ?? ''
})

const showProductPricingWarning = computed(
  () => Boolean(productId.value) && availableSaleTypes.value.length === 0,
)

watch(availableSaleTypes, (types) => {
  if (!types.length) {
    type.value = ''
    return
  }

  if (!type.value || !types.includes(type.value as SaleType)) {
    const firstType = types[0]
    if (firstType) {
      type.value = firstType
    }
  }
})

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

const createSale = async () => {
  error.value = null

  if (!availableSaleTypes.value.length) {
    return
  }

  if (!type.value || !availableSaleTypes.value.includes(type.value as SaleType)) {
    error.value = 'Veuillez selectionner un type de vente configure pour ce produit.'
    return
  }

  loading.value = true

  try {
    const response = await fetch('http://localhost:8080/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: Number(productId.value),
        quantity: Number(quantity.value),
        type: type.value as SaleType,
        seller: seller.value,
        clientId: Number(clientId.value),
      }),
    })
    if (!response.ok) throw new Error('Failed to create sale')
    router.push('/sales')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
  fetchClients()
  fetchPricings()
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Create Sale</h1>
    <form @submit.prevent="createSale" class="max-w-md mx-auto space-y-6">
      <div
        v-if="showProductPricingWarning"
        class="p-4 mb-1 text-sm text-fg-brand-strong rounded-base bg-brand-softer border border-brand-subtle"
        role="alert"
      >
        <div class="flex items-center">
          <svg
            class="w-4 h-4 shrink-0 me-2"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <h3 class="font-medium">Information</h3>
        </div>
        <p class="mt-2">
          Vous ne pouvez pas enregistrer de vente pour
          <span class="font-semibold">{{ selectedProductName || 'ce produit' }}</span>
          car aucun prix n'est configure. Configurez d'abord un pricing.
        </p>
      </div>

      <div class="mb-6">
        <label for="productId" class="block mb-2.5 text-sm font-medium text-heading">Product</label>
        <select
          v-model="productId"
          id="productId"
          required
          class="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs"
        >
          <option value="">Select Product</option>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }}
          </option>
        </select>
      </div>
      <div class="mb-6">
        <label for="quantity" class="block mb-2.5 text-sm font-medium text-heading">Quantity</label>
        <input
          v-model="quantity"
          id="quantity"
          type="number"
          required
          class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
          placeholder="Enter quantity"
        />
      </div>
      <div class="mb-6">
        <label for="type" class="block mb-2.5 text-sm font-medium text-heading">Type</label>
        <select
          v-model="type"
          id="type"
          :disabled="!productId || !availableSaleTypes.length"
          required
          class="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs"
        >
          <option value="" disabled>
            {{ productId ? 'Select sale type' : 'Select product first' }}
          </option>
          <option v-for="saleType in availableSaleTypes" :key="saleType" :value="saleType">
            {{ saleTypeLabel[saleType] }}
          </option>
        </select>
      </div>
      <div class="mb-6">
        <label for="seller" class="block mb-2.5 text-sm font-medium text-heading">Seller</label>
        <input
          v-model="seller"
          id="seller"
          type="text"
          required
          class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
          placeholder="Enter seller name"
        />
      </div>
      <div class="mb-6">
        <label for="clientId" class="block mb-2.5 text-sm font-medium text-heading">Client</label>
        <select
          v-model="clientId"
          id="clientId"
          required
          class="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs"
        >
          <option value="">Select Client</option>
          <option v-for="client in clients" :key="client.id" :value="client.id">
            {{ client.name }}
          </option>
        </select>
      </div>
      <div class="flex space-x-4">
        <button
          type="submit"
          :disabled="loading || showProductPricingWarning"
          class="bg-amber-600 text-white px-4 py-2 rounded-base hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
        >
          {{ loading ? 'Creating...' : 'Create Sale' }}
        </button>
        <router-link
          to="/sales"
          class="bg-gray-500 text-white px-4 py-2 rounded-base hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 inline-block text-center"
        >
          Cancel
        </router-link>
      </div>
    </form>
    <div
      v-if="error"
      class="mt-4 text-sm text-fg-danger-strong bg-danger-soft border border-danger-subtle rounded-base p-3"
    >
      <span class="font-medium">Error:</span> {{ error }}
    </div>
  </div>
</template>
