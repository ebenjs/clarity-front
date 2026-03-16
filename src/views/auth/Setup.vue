/* eslint-disable vue/multi-word-component-names */
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const submit = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  loading.value = true
  error.value = null

  try {
    await auth.bootstrapAdmin(username.value, password.value)
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
    class="min-h-screen grid place-items-center bg-linear-to-br from-amber-100 via-white to-orange-100 p-4"
  >
    <div class="w-full max-w-lg rounded-2xl border border-amber-200 bg-white/95 p-6 shadow-lg">
      <div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
        Première initialisation : créez le premier compte administrateur.
      </div>

      <h1 class="text-2xl font-bold text-slate-900">Initialisation Admin</h1>
      <p class="mt-1 text-sm text-slate-600">
        Ce compte pourra ensuite créer les autres utilisateurs.
      </p>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <div>
          <label for="username" class="mb-1 block text-sm font-medium text-slate-700"
            >Nom d'utilisateur admin</label
          >
          <input
            id="username"
            v-model="username"
            type="text"
            required
            minlength="1"
            class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
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
            minlength="8"
            class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          />
        </div>

        <div>
          <label for="confirmPassword" class="mb-1 block text-sm font-medium text-slate-700"
            >Confirmer le mot de passe</label
          >
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            minlength="8"
            class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
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
          class="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 disabled:opacity-60"
        >
          {{ loading ? 'Initialisation...' : 'Créer le compte admin' }}
        </button>
      </form>
    </div>
  </div>
</template>
