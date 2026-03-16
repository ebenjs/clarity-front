/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import EmptyState from '@/components/EmptyState.vue'
import CreateModal from '@/components/CreateModal.vue'
import { useAuthStore } from '@/stores/auth'

interface User {
  id: number
  username: string
  role: 'ADMIN' | 'SELLER'
}

const auth = useAuthStore()
const createModal = ref<InstanceType<typeof CreateModal>>()
const users = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const columns = [
  { header: 'ID', key: 'id' },
  { header: 'Username', key: 'username' },
  { header: 'Role', key: 'role' },
]

const fetchUsers = async () => {
  loading.value = true
  error.value = null

  try {
    users.value = await auth.fetchUsers()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  createModal.value?.open()
}

const handleCreated = (newUser: unknown) => {
  users.value.unshift(newUser as User)
}

onMounted(fetchUsers)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Utilisateurs</h1>
    <div v-if="loading">Loading...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>

    <DataTable
      v-if="users.length"
      :data="users"
      :columns="columns"
      search-placeholder="Search users..."
      :show-checkbox="false"
      :on-refresh="fetchUsers"
      :on-create="handleCreate"
      create-label="Ajouter un utilisateur"
    />

    <EmptyState
      v-else-if="!loading"
      message="Aucun utilisateur trouvé."
      action-label="Ajouter un utilisateur"
      :on-action="handleCreate"
    />

    <CreateModal
      ref="createModal"
      entity-name="User"
      api-endpoint="users"
      :fields="[
        {
          key: 'username',
          label: 'Username',
          type: 'text',
          required: true,
        },
        {
          key: 'password',
          label: 'Password',
          type: 'password',
          required: true,
        },
        {
          key: 'role',
          label: 'Role',
          type: 'select',
          required: true,
          options: [
            { label: 'Admin', value: 'ADMIN' },
            { label: 'Seller', value: 'SELLER' },
          ],
        },
      ]"
      @created="handleCreated"
    />
  </div>
</template>
