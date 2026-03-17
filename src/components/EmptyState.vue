<script setup lang="ts">
interface Props {
  message: string
  actionLabel?: string
  onAction?: () => void
}

defineProps<Props>()
</script>

<template>
  <div class="rounded-base border border-default p-4 text-center space-y-3">
    <p>{{ message }}</p>
    <button
      v-if="onAction && actionLabel"
      @click="onAction"
      class="bg-amber-600 text-white px-4 py-2 rounded-base hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
