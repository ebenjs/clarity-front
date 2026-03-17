<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'vue-chartjs'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
)

interface SaleRecord {
  id: number
  total: number
  date: string
}

interface CostRecord {
  id: number
  amount: number
  date: string
}

interface StockRecord {
  id: number
  product?: { id: number; name: string }
  quantity: number
  productName?: string
  name?: string
  availableQuantity?: number
  totalQuantity?: number
  stock?: number
}

// Statistiques principales
const stats = ref({
  totalRevenue: 0,
  totalProfit: 0,
  totalSales: 0,
  totalCosts: 0,
  totalProducts: 0,
  totalClients: 0,
})

// Données pour les charts
const salesChartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Ventes mensuelles',
      data: [] as number[],
      backgroundColor: 'rgba(217, 119, 6, 0.45)',
      borderColor: 'rgba(217, 119, 6, 1)',
      borderWidth: 1,
    },
  ],
})

const profitChartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Profit',
      data: [] as number[],
      borderColor: 'rgba(217, 119, 6, 1)',
      backgroundColor: 'rgba(217, 119, 6, 0.12)',
      tension: 0.4,
    },
  ],
})

const stockChartData = ref({
  labels: [] as string[],
  datasets: [
    {
      data: [] as number[],
      backgroundColor: [] as string[],
    },
  ],
})

const loading = ref(true)
const currency = ref('XAF')
const salesChartKey = ref(0)
const stockChartKey = ref(0)
const profitChartKey = ref(0)

const toMonthKey = (dateValue: string) => {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return null

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const sumByMonth = (records: Array<{ date: string; amount: number }>) => {
  const totals = new Map<string, number>()

  records.forEach((record) => {
    const key = toMonthKey(record.date)
    if (!key) return

    const current = totals.get(key) ?? 0
    totals.set(key, current + Number(record.amount ?? 0))
  })

  return totals
}

const countByMonth = (records: Array<{ date: string }>) => {
  const totals = new Map<string, number>()

  records.forEach((record) => {
    const key = toMonthKey(record.date)
    if (!key) return

    const current = totals.get(key) ?? 0
    totals.set(key, current + 1)
  })

  return totals
}

const sortMonthKeys = (keys: string[]) => {
  return [...keys].sort((a, b) => {
    const [yearAToken, monthAToken] = a.split('-')
    const [yearBToken, monthBToken] = b.split('-')

    const yearA = Number(yearAToken) || 0
    const monthA = Number(monthAToken) || 0
    const yearB = Number(yearBToken) || 0
    const monthB = Number(monthBToken) || 0

    if (yearA !== yearB) return yearA - yearB
    return monthA - monthB
  })
}

const getStockQuantity = (stock: StockRecord) => {
  const candidates = [
    Number(stock.quantity),
    Number(stock.availableQuantity),
    Number(stock.totalQuantity),
    Number(stock.stock),
  ]

  return candidates.find((value) => Number.isFinite(value)) ?? 0
}

const getStockLabel = (stock: StockRecord) => {
  return stock.product?.name || stock.productName || stock.name || `Produit #${stock.id}`
}

const formatCurrency = (value: number) => {
  const numeric = Number(value ?? 0)
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.value || 'XAF',
      maximumFractionDigits: 0,
    }).format(numeric)
  } catch {
    return `${numeric.toLocaleString()} ${currency.value || ''}`.trim()
  }
}

const fetchCompanyConfig = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/company-config')
    if (!response.ok) return
    const config = await response.json()
    if (typeof config?.currency === 'string' && config.currency.trim()) {
      currency.value = config.currency.trim()
    }
  } catch (error) {
    console.error('Erreur lors du chargement de la devise:', error)
  }
}

const fetchStats = async () => {
  try {
    await fetchCompanyConfig()

    const [salesResponse, costsResponse, productsResponse, clientsResponse, stocksResponse] =
      await Promise.all([
        fetch('http://localhost:8080/api/sales'),
        fetch('http://localhost:8080/api/costs'),
        fetch('http://localhost:8080/api/products'),
        fetch('http://localhost:8080/api/clients'),
        fetch('http://localhost:8080/api/stocks'),
      ])

    const sales: SaleRecord[] = salesResponse.ok ? await salesResponse.json() : []
    const costs: CostRecord[] = costsResponse.ok ? await costsResponse.json() : []
    const products: unknown[] = productsResponse.ok ? await productsResponse.json() : []
    const clients: unknown[] = clientsResponse.ok ? await clientsResponse.json() : []
    const stocks: StockRecord[] = stocksResponse.ok ? await stocksResponse.json() : []

    const salesByMonthAmount = sumByMonth(
      sales.map((sale) => ({
        date: sale.date,
        amount: Number(sale.total ?? 0),
      })),
    )
    const costsByMonthAmount = sumByMonth(
      costs.map((cost) => ({
        date: cost.date,
        amount: Number(cost.amount ?? 0),
      })),
    )
    const salesByMonthCount = countByMonth(sales)

    const currentMonthKey = toMonthKey(new Date().toISOString())

    stats.value.totalRevenue = currentMonthKey ? (salesByMonthAmount.get(currentMonthKey) ?? 0) : 0
    stats.value.totalCosts = currentMonthKey ? (costsByMonthAmount.get(currentMonthKey) ?? 0) : 0
    stats.value.totalProfit = stats.value.totalRevenue - stats.value.totalCosts
    stats.value.totalSales = currentMonthKey ? (salesByMonthCount.get(currentMonthKey) ?? 0) : 0
    stats.value.totalProducts = products.length
    stats.value.totalClients = clients.length

    const salesMonthKeys = sortMonthKeys(
      [...salesByMonthAmount.keys()].filter((key) => (salesByMonthAmount.get(key) ?? 0) > 0),
    )

    const fallbackMonthKey =
      toMonthKey(new Date().toISOString()) ||
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

    const effectiveSalesMonthKeys: string[] = salesMonthKeys.length
      ? salesMonthKeys
      : [fallbackMonthKey]

    const monthlyRevenue = effectiveSalesMonthKeys.map((key) => salesByMonthAmount.get(key) ?? 0)
    const monthlyCosts = effectiveSalesMonthKeys.map((key) => costsByMonthAmount.get(key) ?? 0)
    const monthlyProfit = monthlyRevenue.map((amount, index) => amount - (monthlyCosts[index] ?? 0))

    salesChartData.value = {
      labels: [...effectiveSalesMonthKeys],
      datasets: [
        {
          label: 'Ventes mensuelles',
          data: [...monthlyRevenue],
          backgroundColor: 'rgba(217, 119, 6, 0.45)',
          borderColor: 'rgba(217, 119, 6, 1)',
          borderWidth: 1,
        },
      ],
    }
    salesChartKey.value += 1

    profitChartData.value = {
      labels: [...effectiveSalesMonthKeys],
      datasets: [
        {
          label: 'Profit',
          data: [...monthlyProfit],
          borderColor: 'rgba(217, 119, 6, 1)',
          backgroundColor: 'rgba(217, 119, 6, 0.12)',
          tension: 0.4,
        },
      ],
    }
    profitChartKey.value += 1

    const positiveStocks = stocks.filter((stock) => getStockQuantity(stock) > 0)
    const topStocks = positiveStocks
      .sort((a, b) => getStockQuantity(b) - getStockQuantity(a))
      .slice(0, 8)

    const stockPalette = [
      'rgba(217, 119, 6, 0.85)',
      'rgba(245, 158, 11, 0.85)',
      'rgba(251, 191, 36, 0.85)',
      'rgba(202, 138, 4, 0.85)',
      'rgba(146, 64, 14, 0.85)',
      'rgba(180, 83, 9, 0.85)',
      'rgba(234, 88, 12, 0.85)',
      'rgba(161, 98, 7, 0.85)',
    ]
    const paletteSize = stockPalette.length

    stockChartData.value = {
      labels: topStocks.map((stock) => getStockLabel(stock)),
      datasets: [
        {
          data: topStocks.map((stock) => getStockQuantity(stock)),
          backgroundColor: topStocks.map(
            (_, index) =>
              stockPalette[index % paletteSize] || stockPalette[0] || 'rgba(217, 119, 6, 0.85)',
          ),
        },
      ],
    }
    stockChartKey.value += 1
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="min-h-screen bg-neutral-primary-soft p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-heading mb-2">Tableau de Bord Clarity</h1>
      <p class="text-body">Aperçu général de votre activité commerciale</p>
    </div>

    <!-- Statistiques principales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-sm border border-default-medium p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-body">Chiffre d'Affaires</p>
            <p class="text-2xl font-bold text-heading">
              {{ formatCurrency(stats.totalRevenue) }}
            </p>
          </div>
          <div class="p-3 bg-amber-100 rounded-full">
            <svg
              class="w-6 h-6 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-default-medium p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-body">Profit</p>
            <p class="text-2xl font-bold text-heading">
              {{ formatCurrency(stats.totalProfit) }}
            </p>
          </div>
          <div class="p-3 bg-amber-100 rounded-full">
            <svg
              class="w-6 h-6 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-default-medium p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-body">Ventes</p>
            <p class="text-2xl font-bold text-heading">{{ stats.totalSales }}</p>
          </div>
          <div class="p-3 bg-amber-100 rounded-full">
            <svg
              class="w-6 h-6 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-default-medium p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-body">Coûts</p>
            <p class="text-2xl font-bold text-heading">{{ formatCurrency(stats.totalCosts) }}</p>
          </div>
          <div class="p-3 bg-red-100 rounded-full">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Ventes Mensuelles -->
      <div class="bg-white rounded-lg shadow-sm border border-default-medium p-6">
        <h3 class="text-lg font-semibold text-heading mb-4">Ventes Mensuelles</h3>
        <div class="h-64">
          <Bar
            :key="salesChartKey"
            :data="salesChartData"
            :options="{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function (value) {
                      return formatCurrency(Number(value))
                    },
                  },
                },
              },
            }"
          />
        </div>
      </div>

      <!-- Répartition des Stocks -->
      <div class="bg-white rounded-lg shadow-sm border border-default-medium p-6">
        <h3 class="text-lg font-semibold text-heading mb-4">Répartition des Stocks</h3>
        <div class="h-64 flex items-center justify-center">
          <Doughnut
            :key="stockChartKey"
            :data="stockChartData"
            :options="{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }"
          />
        </div>
      </div>
    </div>

    <!-- Profit Chart -->
    <div class="bg-white rounded-lg shadow-sm border border-default-medium p-6 mb-8">
      <h3 class="text-lg font-semibold text-heading mb-4">Évolution du Profit</h3>
      <div class="h-64">
        <Line
          :key="profitChartKey"
          :data="profitChartData"
          :options="{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function (value) {
                    return formatCurrency(Number(value))
                  },
                },
              },
            },
          }"
        />
      </div>
    </div>
  </div>
</template>
