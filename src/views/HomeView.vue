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
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Ventes mensuelles',
      data: [12000, 19000, 15000, 25000, 22000, 30000],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    },
  ],
})

const profitChartData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Profit',
      data: [2000, 4000, 3000, 5000, 4500, 6000],
      borderColor: 'rgba(34, 197, 94, 1)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
    },
  ],
})

const stockChartData = ref({
  labels: ['Produits A', 'Produits B', 'Produits C', 'Produits D', 'Produits E'],
  datasets: [
    {
      data: [120, 80, 150, 90, 200],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
      ],
    },
  ],
})

const loading = ref(true)
const currency = ref('XAF')

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

// Fonctions pour charger les données depuis l'API
const fetchStats = async () => {
  try {
    await fetchCompanyConfig()

    // Récupérer les statistiques principales
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1

    // Turnover mensuel
    const turnoverResponse = await fetch(
      `http://localhost:8080/api/reports/turnover/monthly?year=${year}&month=${month}`,
    )
    if (turnoverResponse.ok) {
      stats.value.totalRevenue = await turnoverResponse.json()
    }

    // Profit mensuel
    const profitResponse = await fetch(
      `http://localhost:8080/api/reports/profit/monthly?year=${year}&month=${month}`,
    )
    if (profitResponse.ok) {
      stats.value.totalProfit = await profitResponse.json()
    }

    // Résumé mensuel pour les ventes et coûts
    const summaryResponse = await fetch(
      `http://localhost:8080/api/reports/summary/monthly?year=${year}&month=${month}`,
    )
    if (summaryResponse.ok) {
      const summary = await summaryResponse.json()
      stats.value.totalSales = summary.totalSales || 0
      stats.value.totalCosts = summary.totalCosts || 0
    }

    // Nombre de produits
    const productsResponse = await fetch('http://localhost:8080/api/products')
    if (productsResponse.ok) {
      const products = await productsResponse.json()
      stats.value.totalProducts = products.length
    }

    // Nombre de clients
    const clientsResponse = await fetch('http://localhost:8080/api/clients')
    if (clientsResponse.ok) {
      const clients = await clientsResponse.json()
      stats.value.totalClients = clients.length
    }

    // Données pour les charts
    await fetchChartData(year, month)
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  } finally {
    loading.value = false
  }
}

const fetchChartData = async (year: number, month: number) => {
  try {
    // Ventes mensuelles pour le chart
    const salesResponse = await fetch(
      `http://localhost:8080/api/reports/sales/monthly?year=${year}&month=${month}`,
    )
    if (salesResponse.ok) {
      const salesData = await salesResponse.json()
      // Adapter les données selon la structure de l'API
      if (Array.isArray(salesData) && salesChartData.value.datasets[0]) {
        salesChartData.value.labels = salesData.map((item) => item.month || item.label)
        salesChartData.value.datasets[0].data = salesData.map((item) => item.amount || item.value)
      }
    }

    // Aperçu des stocks pour le chart circulaire
    const stockResponse = await fetch('http://localhost:8080/api/reports/stock/overview')
    if (stockResponse.ok) {
      const stockData = await stockResponse.json()
      if (Array.isArray(stockData) && stockChartData.value.datasets[0]) {
        stockChartData.value.labels = stockData.map((item) => item.productName || item.name)
        stockChartData.value.datasets[0].data = stockData.map((item) => item.quantity || item.value)
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données de chart:', error)
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
          <div class="p-3 bg-green-100 rounded-full">
            <svg
              class="w-6 h-6 text-green-600"
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
          <div class="p-3 bg-blue-100 rounded-full">
            <svg
              class="w-6 h-6 text-blue-600"
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
          <div class="p-3 bg-purple-100 rounded-full">
            <svg
              class="w-6 h-6 text-purple-600"
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
