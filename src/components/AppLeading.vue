<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'
import { Logout05Icon } from '@hugeicons/core-free-icons'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const logout = async () => {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <span class="flex items-center justify-between">
    <span class="text-xl">Clarity App</span>
    <button
      type="button"
      @click="logout"
      class="inline-flex items-center justify-center rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
      title="Se déconnecter"
      aria-label="Se déconnecter"
    >
      <HugeiconsIcon :icon="Logout05Icon" />
    </button>
  </span>
</template>

<style scoped></style>
