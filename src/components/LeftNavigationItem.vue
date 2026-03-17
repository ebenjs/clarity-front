<script setup lang="ts">
import { HugeiconsIcon } from '@hugeicons/vue'

const props = defineProps<{
  id: number
  label: string
  icon?: unknown
  isActive?: boolean
}>()

defineEmits(['linkSelected'])
</script>

<template>
  <div
    @click="$emit('linkSelected')"
    :class="[
      'flex items-center p-3 rounded-md cursor-pointer',
      isActive
        ? 'bg-amber-100 text-amber-800 font-medium'
        : 'hover:bg-amber-100 hover:text-amber-800',
    ]"
  >
    <HugeiconsIcon :icon="props.icon" />
    <span class="ml-2">{{ props.label }}</span>
  </div>
</template>

<style scoped></style>
