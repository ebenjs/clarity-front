<script setup lang="ts">
defineProps<{
  isDark: boolean
}>()

defineEmits<{
  (event: 'toggle-theme'): void
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-3">
    <span class="text-xl font-semibold text-slate-900 dark-title">Clarity App</span>

    <button
      type="button"
      @click="$emit('toggle-theme')"
      class="inline-flex items-center rounded-full border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
      :title="isDark ? 'Passer en mode clair' : 'Passer en mode sombre'"
      :aria-label="isDark ? 'Passer en mode clair' : 'Passer en mode sombre'"
    >
      <span
        class="mr-2 inline-block h-2 w-2 rounded-full"
        :class="isDark ? 'bg-amber-500' : 'bg-slate-400'"
      ></span>
      {{ isDark ? 'Sombre' : 'Clair' }}
    </button>
  </div>
</template>

<style scoped></style>
