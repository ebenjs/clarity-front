<script setup lang="ts">
import { ref, computed } from 'vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import { AddCircleIcon, RepeatIcon } from '@hugeicons/core-free-icons'

interface Column {
  header: string
  key: string
  sortable?: boolean
}

interface Action {
  label: string
  action: (item: any) => void
  class?: string
}

interface FilterOption {
  label: string
  value: string
}

const props = defineProps<{
  columns: Column[]
  data: any[]
  searchPlaceholder?: string
  filterOptions?: FilterOption[]
  actions?: Action[]
  showCheckbox?: boolean
  onRefresh?: () => void
  onCreate?: () => void
  createLabel?: string
}>()

const searchQuery = ref('')
const selectedFilter = ref('')
const selectedItems = ref<any[]>([])

const filteredData = computed(() => {
  let filtered = props.data

  if (searchQuery.value) {
    filtered = filtered.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchQuery.value.toLowerCase()),
      ),
    )
  }

  if (selectedFilter.value) {
    // Implement filter logic based on selectedFilter
    // For now, assume filter by a specific key
    filtered = filtered.filter((item) => item[selectedFilter.value])
  }

  return filtered
})

const toggleSelectAll = () => {
  if (selectedItems.value.length === filteredData.value.length) {
    selectedItems.value = []
  } else {
    selectedItems.value = [...filteredData.value]
  }
}

const toggleSelectItem = (item: any) => {
  const index = selectedItems.value.findIndex((selected) => selected.id === item.id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(item)
  }
}

const isSelected = (item: any) => {
  return selectedItems.value.some((selected) => selected.id === item.id)
}

const isAllSelected = computed(() => {
  return filteredData.value.length > 0 && selectedItems.value.length === filteredData.value.length
})
</script>

<template>
  <div class="relative overflow-x-auto bg-neutral-primary-soft rounded-base border border-default">
    <div class="p-4 flex items-center justify-between space-x-4">
      <label for="input-group-1" class="sr-only">Search</label>
      <div class="relative flex-1 max-w-96">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg
            class="w-4 h-4 text-body"
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
              stroke-width="2"
              d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          id="input-group-1"
          class="block w-full ps-9 pe-3 py-2 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body"
          :placeholder="searchPlaceholder || 'Search'"
        />
      </div>
      <div class="flex items-center space-x-2">
        <button
          v-if="onRefresh"
          @click="onRefresh"
          class="inline-flex items-center justify-center text-body bg-neutral-secondary-medium border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-3 py-2 focus:outline-none"
          type="button"
        >
          <HugeiconsIcon :icon="RepeatIcon" />
        </button>
        <button
          v-if="onCreate"
          @click="onCreate"
          class="inline-flex items-center justify-center text-white bg-green-500 border border-green-500 hover:bg-green-600 hover:border-green-600 focus:ring-4 focus:ring-green-300 shadow-xs font-medium leading-5 rounded-base text-sm px-3 py-2 focus:outline-none"
          type="button"
        >
          <HugeiconsIcon :icon="AddCircleIcon" />
          <span class="ml-2">
            {{ createLabel || 'Create' }}
          </span>
        </button>
      </div>
      <div v-if="filterOptions && filterOptions.length" class="relative">
        <button
          id="dropdownDefaultButton"
          data-dropdown-toggle="dropdown"
          class="shrink-0 inline-flex items-center justify-center text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-3 py-2 focus:outline-none"
          type="button"
        >
          <svg
            class="w-4 h-4 me-1.5 -ms-0.5"
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
              stroke-width="2"
              d="M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z"
            />
          </svg>
          Filter by
          <svg
            class="w-4 h-4 ms-1.5 -me-0.5"
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
              d="m19 9-7 7-7-7"
            />
          </svg>
        </button>
        <!-- Dropdown menu -->
        <div
          id="dropdown"
          class="z-10 hidden bg-neutral-primary-medium border border-default-medium rounded-base shadow-lg w-32"
        >
          <ul class="p-2 text-sm text-body font-medium" aria-labelledby="dropdownDefaultButton">
            <li v-for="option in filterOptions" :key="option.value">
              <a
                href="#"
                @click="selectedFilter = option.value"
                class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded"
              >
                {{ option.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <table class="w-full text-sm text-left rtl:text-right text-body">
      <thead
        class="text-sm text-body bg-neutral-secondary-medium border-b border-t border-default-medium"
      >
        <tr>
          <th v-if="showCheckbox" scope="col" class="p-4">
            <div class="flex items-center">
              <input
                id="table-checkbox-all"
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft"
              />
              <label for="table-checkbox-all" class="sr-only">Select all</label>
            </div>
          </th>
          <th v-for="column in columns" :key="column.key" scope="col" class="px-6 py-3 font-medium">
            {{ column.header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in filteredData"
          :key="item.id"
          class="bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium"
        >
          <td v-if="showCheckbox" class="w-4 p-4">
            <div class="flex items-center">
              <input
                :id="'table-checkbox-' + item.id"
                type="checkbox"
                :checked="isSelected(item)"
                @change="toggleSelectItem(item)"
                class="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft"
              />
              <label :for="'table-checkbox-' + item.id" class="sr-only">Table checkbox</label>
            </div>
          </td>
          <td
            v-for="column in columns"
            :key="column.key"
            :class="column.key === 'actions' ? 'px-6 py-4' : 'px-6 py-4'"
          >
            <template v-if="column.key === 'actions' && actions">
              <div class="flex space-x-2">
                <button
                  v-for="action in actions"
                  :key="action.label"
                  @click="action.action(item)"
                  :class="action.class || 'font-medium text-fg-brand hover:underline'"
                >
                  {{ action.label }}
                </button>
              </div>
            </template>
            <template v-else>
              {{ item[column.key] }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
