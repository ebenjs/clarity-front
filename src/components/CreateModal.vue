<template>
  <Modal ref="modal" :title="`Create ${entityName}`" @close="handleClose">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div
        v-if="warningMessage"
        class="p-4 text-sm text-fg-brand-strong rounded-base bg-brand-softer border border-brand-subtle"
        role="alert"
      >
        <div class="flex items-center">
          <svg
            class="w-4 h-4 shrink-0 me-2"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <h3 class="font-medium">Information</h3>
        </div>
        <p class="mt-2">{{ warningMessage }}</p>
      </div>

      <div v-for="field in visibleFields" :key="field.key" class="space-y-1">
        <label :for="field.key" class="block text-sm font-medium text-heading">{{
          field.label
        }}</label>
        <select
          v-if="field.type === 'select'"
          :id="field.key"
          v-model="form[field.key]"
          :class="
            field.class ||
            'block w-full px-3 py-2 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body'
          "
          :required="field.required !== false"
        >
          <option value="">{{ field.placeholder || `Select ${field.label.toLowerCase()}` }}</option>
          <option
            v-for="option in resolveFieldOptions(field)"
            :key="String(option.value)"
            :value="String(option.value)"
          >
            {{ option.label }}
          </option>
        </select>
        <input
          v-else
          :id="field.key"
          v-model="form[field.key]"
          :type="field.type || 'text'"
          :class="
            field.class ||
            'block w-full px-3 py-2 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body'
          "
          :placeholder="field.placeholder || `Enter ${field.label.toLowerCase()}`"
          :required="field.required !== false"
        />
      </div>
      <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
      <div class="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          @click="handleClose"
          class="inline-flex items-center justify-center text-body bg-neutral-secondary-medium border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2 focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="inline-flex items-center justify-center text-white bg-amber-600 border border-amber-600 hover:bg-amber-700 hover:border-amber-700 focus:ring-4 focus:ring-amber-200 shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2 focus:outline-none disabled:opacity-50"
        >
          <span v-if="loading">Creating...</span>
          <span v-else>Create {{ entityName }}</span>
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import Modal from './Modal.vue'

interface Field {
  key: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  class?: string
  valueType?: 'string' | 'number'
  isVisible?: (form: Record<string, unknown>) => boolean
  options?:
    | Array<{
        label: string
        value: string | number
      }>
    | ((form: Record<string, unknown>) => Array<{
        label: string
        value: string | number
      }>)
}

interface Props {
  entityName: string
  apiEndpoint: string
  fields: Field[]
  validate?: (form: Record<string, unknown>) => string | null
  warning?: (form: Record<string, unknown>) => string | null
  payloadBuilder?: (form: Record<string, unknown>) => Record<string, unknown>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  created: [item: unknown]
  close: []
}>()

const modal = ref<InstanceType<typeof Modal>>()
const loading = ref(false)
const error = ref<string | null>(null)

const form = reactive<Record<string, unknown>>({})

const visibleFields = computed(() =>
  props.fields.filter((field) => (field.isVisible ? field.isVisible(form) : true)),
)

const warningMessage = computed(() => props.warning?.(form) ?? null)

const resolveFieldOptions = (field: Field) => {
  if (!field.options) return []
  return typeof field.options === 'function' ? field.options(form) : field.options
}

const normalizeValue = (field: Field, value: unknown) => {
  if (field.valueType === 'number') {
    return value === '' || value === null || value === undefined ? null : Number(value)
  }

  return value
}

const buildPayload = () => {
  if (props.payloadBuilder) {
    return props.payloadBuilder(form)
  }

  return props.fields.reduce<Record<string, unknown>>((payload, field) => {
    payload[field.key] = normalizeValue(field, form[field.key])
    return payload
  }, {})
}

const open = () => {
  modal.value?.open()
  // Reset form
  props.fields.forEach((field) => {
    form[field.key] = ''
  })
  error.value = null
}

const close = () => {
  modal.value?.close()
}

const handleClose = () => {
  close()
  emit('close')
}

const handleSubmit = async () => {
  const validationError = props.validate?.(form) ?? null
  if (validationError) {
    error.value = validationError
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await fetch(`http://localhost:8080/api/${props.apiEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildPayload()),
    })

    if (!response.ok) throw new Error('Failed to create item')

    const newItem = await response.json()
    emit('created', newItem)
    close()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

defineExpose({
  open,
  close,
})
</script>
