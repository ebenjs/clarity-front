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
      isActive ? 'bg-violet-500 text-white' : ' hover:bg-violet-200 hover:text-black',
    ]"
  >
    <HugeiconsIcon :icon="props.icon" />
    <span class="ml-2">{{ props.label }}</span>
  </div>
</template>

<style scoped></style>
