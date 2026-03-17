<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppLeading from './components/AppLeading.vue'
import LeftNavigationItem from './components/LeftNavigationItem.vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  ApartmentIcon,
  ChartAnalysisIcon,
  Coins02Icon,
  Configuration01Icon,
  CreditCardPosIcon,
  Home01Icon,
  Idea01Icon,
  LocationUser01Icon,
  PackageIcon,
  PackageProcessIcon,
  Logout05Icon,
  SaleTag01Icon,
  TradeUpIcon,
} from '@hugeicons/core-free-icons'
import { computed, onMounted, ref, watch } from 'vue'
import router from './router'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const auth = useAuthStore()
const THEME_STORAGE_KEY = 'clarity-theme'

const navigationLinks = [
  { id: 1, icon: Home01Icon, label: 'Accueil', routerLink: '/' },
  { id: 2, icon: LocationUser01Icon, label: 'Clients', routerLink: '/clients' },
  { id: 3, icon: PackageIcon, label: 'Produits', routerLink: '/products' },
  { id: 4, icon: SaleTag01Icon, label: 'Ventes', routerLink: '/sales' },
  { id: 5, icon: TradeUpIcon, label: 'Gestion des Prix', routerLink: '/pricings' },
  { id: 6, icon: PackageProcessIcon, label: 'Commandes', routerLink: '/purchases' },
  { id: 7, icon: CreditCardPosIcon, label: 'Lignes de coûts', routerLink: '/costs' },
  { id: 8, icon: Coins02Icon, label: 'Categories de coûts', routerLink: '/cost-categories' },
  { id: 9, icon: ApartmentIcon, label: 'Stock', routerLink: '/stocks' },
  { id: 10, icon: Idea01Icon, label: 'Inventaire', routerLink: '/inventories', adminOnly: true },
  {
    id: 11,
    icon: LocationUser01Icon,
    label: 'Utilisateurs',
    routerLink: '/users',
    adminOnly: true,
  },
  { id: 12, icon: ChartAnalysisIcon, label: 'Statistiques', routerLink: '/reports' },
  { id: 13, icon: Configuration01Icon, label: 'Configuration', routerLink: '/config' },
]

const activeLinkId = ref<number>(1)

const visibleNavigationLinks = computed(() =>
  navigationLinks.filter((link) => !link.adminOnly || auth.isAdmin),
)

const isAuthScreen = computed(() => route.name === 'login' || route.name === 'setup')
const isDarkMode = ref(false)

const connectedUsername = computed(() => auth.user?.username?.trim() || 'Utilisateur')

const userInitials = computed(() => {
  const words = connectedUsername.value.split(/\s+/).filter(Boolean)

  if (words.length === 0) return 'U'
  if (words.length === 1) {
    const firstWord = words[0]
    return (firstWord ? firstWord.slice(0, 2) : 'U').toUpperCase()
  }

  const firstLetter = words[0]?.[0] ?? ''
  const secondLetter = words[1]?.[0] ?? ''
  return `${firstLetter}${secondLetter}`.toUpperCase()
})

watch(
  () => route.path,
  (path) => {
    const selectedLink = [...navigationLinks]
      .sort((a, b) => b.routerLink.length - a.routerLink.length)
      .find((link) => path === link.routerLink || path.startsWith(`${link.routerLink}/`))
    if (selectedLink) {
      activeLinkId.value = selectedLink.id
    }
  },
  { immediate: true },
)

const setActiveLink = (id: number) => {
  activeLinkId.value = id
  const selectedLink = navigationLinks.find((link) => link.id === id)
  if (selectedLink) {
    router.push(selectedLink.routerLink)
  }
}

const logout = async () => {
  await auth.logout()
  router.push('/login')
}

const applyTheme = (useDarkTheme: boolean) => {
  document.documentElement.classList.toggle('theme-dark', useDarkTheme)
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
}

onMounted(() => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)

  if (storedTheme === 'dark' || storedTheme === 'light') {
    isDarkMode.value = storedTheme === 'dark'
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  applyTheme(isDarkMode.value)
})

watch(isDarkMode, (useDarkTheme) => {
  applyTheme(useDarkTheme)
  localStorage.setItem(THEME_STORAGE_KEY, useDarkTheme ? 'dark' : 'light')
})
</script>

<template>
  <RouterView v-if="isAuthScreen" />

  <div v-else class="h-screen bg-gray-100">
    <aside
      class="fixed inset-y-0 left-0 z-20 w-72 border-r border-gray-300 bg-white p-6 flex flex-col"
    >
      <AppLeading :is-dark="isDarkMode" @toggle-theme="toggleTheme" />
      <div class="mt-6 flex flex-col gap-2 flex-1 overflow-y-auto">
        <LeftNavigationItem
          v-for="link in visibleNavigationLinks"
          :key="link.id"
          :id="link.id"
          :label="link.label"
          :icon="link.icon"
          :isActive="activeLinkId === link.id"
          @link-selected="setActiveLink(link.id)"
        />
      </div>

      <div class="mt-4 pt-4 border-t border-gray-200">
        <div class="flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2">
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="h-9 w-9 shrink-0 rounded-full bg-amber-600 text-white text-sm font-semibold grid place-items-center"
            >
              {{ userInitials }}
            </div>
            <span class="text-sm font-medium text-amber-900 truncate">{{ connectedUsername }}</span>
          </div>

          <button
            type="button"
            @click="logout"
            class="inline-flex items-center justify-center rounded-md p-2 text-amber-700 transition-colors hover:bg-amber-100 hover:text-amber-900"
            title="Se déconnecter"
            aria-label="Se déconnecter"
          >
            <HugeiconsIcon :icon="Logout05Icon" />
          </button>
        </div>
      </div>
    </aside>

    <main class="h-screen overflow-y-auto ml-72 mr-80 p-6">
      <RouterView />
    </main>

    <aside
      class="fixed inset-y-0 right-0 z-20 w-80 border-l border-gray-300 bg-white p-6 overflow-y-auto"
    >
      <div class="mb-3">
        <span class="text-xl">Centre d'aide</span>
      </div>
      <div
        id="alert-additional-content-1"
        class="p-4 mb-4 text-sm text-fg-brand-strong rounded-base bg-brand-softer border border-brand-subtle"
        role="alert"
      >
        <div class="flex items-center justify-between">
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
            <span class="sr-only">Info</span>
            <h3 class="font-medium">Information</h3>
          </div>
        </div>
        <div class="mt-2 mb-4">
          Le contenu d'aide concernant la section actuelle sera affiché ici s'il est disponible.
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped></style>
