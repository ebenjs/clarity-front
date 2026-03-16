/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const submit = async () => {
  loading.value = true
  error.value = null

  try {
    await auth.login(username.value, password.value)

    if (auth.bootstrapRequired) {
      router.push('/setup')
      return
    }

    router.push('/')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen grid place-items-center bg-linear-to-br from-slate-100 via-white to-cyan-100 p-4"
  >
    <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg">
      <h1 class="text-2xl font-bold text-slate-900">Connexion</h1>
      <p class="mt-1 text-sm text-slate-600">Entrez vos identifiants pour accéder à Clarity.</p>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <div>
          <label for="username" class="mb-1 block text-sm font-medium text-slate-700"
            >Nom d'utilisateur</label
          >
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
        </div>

        <div>
          <label for="password" class="mb-1 block text-sm font-medium text-slate-700"
            >Mot de passe</label
          >
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
        </div>

        <div
          v-if="error"
          class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        >
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 disabled:opacity-60"
        >
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>
    </div>
  </div>
</template>
