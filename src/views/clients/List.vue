/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import CreateModal from '@/components/CreateModal.vue'
import EmptyState from '@/components/EmptyState.vue'

interface Client {
  id: number
  name: string
  phone: string
  email: string
  address: string
}

const router = useRouter()
const createModal = ref<InstanceType<typeof CreateModal>>()
const clients = ref<Client[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchClients = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:8080/api/clients')
    if (!response.ok) throw new Error('Failed to fetch clients')
    clients.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const deleteClient = async (id: number) => {
  if (!confirm('Are you sure you want to delete this client?')) return
  try {
    const response = await fetch(`http://localhost:8080/api/clients/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete client')
    clients.value = clients.value.filter((c) => c.id !== id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const columns = [
  { header: 'ID', key: 'id' },
  { header: 'Name', key: 'name' },
  { header: 'Phone', key: 'phone' },
  { header: 'Email', key: 'email' },
  { header: 'Address', key: 'address' },
]

const actions = [
  {
    label: 'Edit',
    action: (item: Client) => {
      router.push(`/clients/edit/${item.id}`)
    },
    class: 'text-amber-600 hover:text-amber-700',
  },
  {
    label: 'Delete',
    action: (item: Client) => deleteClient(item.id),
    class: 'text-red-500 hover:text-red-700',
  },
]

const handleCreate = () => {
  createModal.value?.open()
}

const handleCreated = (newClient: unknown) => {
  clients.value.push(newClient as Client)
}

onMounted(fetchClients)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Clients</h1>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
    <DataTable
      v-if="clients.length"
      :data="clients"
      :columns="columns"
      :actions="actions"
      search-placeholder="Search clients..."
      :show-checkbox="true"
      :on-refresh="fetchClients"
      :on-create="handleCreate"
      create-label="Create Client"
    />
    <EmptyState
      v-else-if="!loading"
      message="No clients found."
      action-label="Create Client"
      :on-action="handleCreate"
    />
    <CreateModal
      ref="createModal"
      entity-name="Client"
      api-endpoint="clients"
      :fields="[
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'phone', label: 'Phone', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'address', label: 'Address', type: 'text', required: false },
      ]"
      @created="handleCreated"
    />
  </div>
</template>
