<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const clientId = ref(Number(route.params.id))
const name = ref('')
const phone = ref('')
const email = ref('')
const address = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const fetchClient = async () => {
  loading.value = true
  try {
    const response = await fetch(`http://localhost:8080/api/clients/${clientId.value}`)
    if (!response.ok) throw new Error('Failed to fetch client')
    const client = await response.json()
    name.value = client.name
    phone.value = client.phone
    email.value = client.email
    address.value = client.address
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const updateClient = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`http://localhost:8080/api/clients/${clientId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        phone: phone.value,
        email: email.value,
        address: address.value,
      }),
    })
    if (!response.ok) throw new Error('Failed to update client')
    router.push('/clients')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(fetchClient)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Edit Client</h1>
    <form @submit.prevent="updateClient" class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium">Name</label>
        <input
          v-model="name"
          id="name"
          type="text"
          required
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label for="phone" class="block text-sm font-medium">Phone</label>
        <input
          v-model="phone"
          id="phone"
          type="text"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label for="email" class="block text-sm font-medium">Email</label>
        <input
          v-model="email"
          id="email"
          type="email"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label for="address" class="block text-sm font-medium">Address</label>
        <textarea
          v-model="address"
          id="address"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        ></textarea>
      </div>
      <button type="submit" :disabled="loading" class="bg-blue-500 text-white px-4 py-2 rounded">
        {{ loading ? 'Updating...' : 'Update' }}
      </button>
      <router-link to="/clients" class="ml-2 text-blue-500">Cancel</router-link>
    </form>
    <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>
  </div>
</template>
