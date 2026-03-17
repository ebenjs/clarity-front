<script setup lang="ts">
import { ref } from 'vue'

const monthlyTurnover = ref<number | null>(null)
const monthlySummary = ref<Record<string, unknown> | null>(null)
const stockOverview = ref<Record<string, unknown> | null>(null)
const monthlySales = ref<Record<string, unknown> | null>(null)
const monthlyProfit = ref<number | null>(null)
const monthlyCosts = ref<Record<string, unknown> | null>(null)
const year = ref('2024')
const month = ref('1')
const loading = ref(false)
const error = ref<string | null>(null)

const fetchMonthlyTurnover = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(
      `http://localhost:8080/api/reports/turnover/monthly?year=${year.value}&month=${month.value}`,
    )
    if (!response.ok) throw new Error('Failed to fetch turnover')
    monthlyTurnover.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const fetchMonthlySummary = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(
      `http://localhost:8080/api/reports/summary/monthly?year=${year.value}&month=${month.value}`,
    )
    if (!response.ok) throw new Error('Failed to fetch summary')
    monthlySummary.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const fetchStockOverview = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/reports/stock/overview')
    if (!response.ok) throw new Error('Failed to fetch stock overview')
    stockOverview.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const fetchMonthlySales = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(
      `http://localhost:8080/api/reports/sales/monthly?year=${year.value}&month=${month.value}`,
    )
    if (!response.ok) throw new Error('Failed to fetch sales')
    monthlySales.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const fetchMonthlyProfit = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(
      `http://localhost:8080/api/reports/profit/monthly?year=${year.value}&month=${month.value}`,
    )
    if (!response.ok) throw new Error('Failed to fetch profit')
    monthlyProfit.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const fetchMonthlyCosts = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(
      `http://localhost:8080/api/reports/costs/monthly?year=${year.value}&month=${month.value}`,
    )
    if (!response.ok) throw new Error('Failed to fetch costs')
    monthlyCosts.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Reports</h1>
    <div class="mb-4">
      <label for="year" class="mr-2">Year:</label>
      <input v-model="year" id="year" type="number" class="border px-2 py-1" />
      <label for="month" class="ml-4 mr-2">Month:</label>
      <input v-model="month" id="month" type="number" min="1" max="12" class="border px-2 py-1" />
    </div>
    <div class="space-y-4">
      <div>
        <button @click="fetchMonthlyTurnover" class="bg-amber-600 text-white px-4 py-2 rounded">
          Get Monthly Turnover
        </button>
        <div v-if="monthlyTurnover !== null">Turnover: {{ monthlyTurnover }}</div>
      </div>
      <div>
        <button @click="fetchMonthlySummary" class="bg-amber-600 text-white px-4 py-2 rounded">
          Get Monthly Summary
        </button>
        <pre v-if="monthlySummary">{{ JSON.stringify(monthlySummary, null, 2) }}</pre>
      </div>
      <div>
        <button @click="fetchStockOverview" class="bg-amber-600 text-white px-4 py-2 rounded">
          Get Stock Overview
        </button>
        <pre v-if="stockOverview">{{ JSON.stringify(stockOverview, null, 2) }}</pre>
      </div>
      <div>
        <button @click="fetchMonthlySales" class="bg-amber-600 text-white px-4 py-2 rounded">
          Get Monthly Sales
        </button>
        <pre v-if="monthlySales">{{ JSON.stringify(monthlySales, null, 2) }}</pre>
      </div>
      <div>
        <button @click="fetchMonthlyProfit" class="bg-amber-600 text-white px-4 py-2 rounded">
          Get Monthly Profit
        </button>
        <div v-if="monthlyProfit !== null">Profit: {{ monthlyProfit }}</div>
      </div>
      <div>
        <button @click="fetchMonthlyCosts" class="bg-amber-600 text-white px-4 py-2 rounded">
          Get Monthly Costs
        </button>
        <pre v-if="monthlyCosts">{{ JSON.stringify(monthlyCosts, null, 2) }}</pre>
      </div>
    </div>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
  </div>
</template>
