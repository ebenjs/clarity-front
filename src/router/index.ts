import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TestView from '@/views/TestView.vue'
import ProductsList from '@/views/products/List.vue'
import ProductsCreate from '@/views/products/Create.vue'
import ProductsEdit from '@/views/products/Edit.vue'
import PricingsList from '@/views/pricings/List.vue'
import PricingsCreate from '@/views/pricings/Create.vue'
import PricingsEdit from '@/views/pricings/Edit.vue'
import InventoriesList from '@/views/inventories/List.vue'
import InventoriesCreate from '@/views/inventories/Create.vue'
import InventoriesEdit from '@/views/inventories/Edit.vue'
import CostsList from '@/views/costs/List.vue'
import CostsCreate from '@/views/costs/Create.vue'
import CostsEdit from '@/views/costs/Edit.vue'
import CostCategoriesList from '@/views/cost-categories/List.vue'
import CostCategoriesCreate from '@/views/cost-categories/Create.vue'
import CostCategoriesEdit from '@/views/cost-categories/Edit.vue'
import ClientsList from '@/views/clients/List.vue'
import ClientsCreate from '@/views/clients/Create.vue'
import ClientsEdit from '@/views/clients/Edit.vue'
import SalesList from '@/views/sales/List.vue'
import SalesCreate from '@/views/sales/Create.vue'
import PurchasesList from '@/views/purchases/List.vue'
import PurchasesCreate from '@/views/purchases/Create.vue'
import StocksList from '@/views/stocks/List.vue'
import ConfigEdit from '@/views/config/Edit.vue'
import ReportsIndex from '@/views/reports/Index.vue'
import LoginView from '@/views/auth/Login.vue'
import SetupView from '@/views/auth/Setup.vue'
import UsersList from '@/views/users/List.vue'
import { useAuthStore } from '@/stores/auth'
import { pinia } from '@/stores'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/setup',
      name: 'setup',
      component: SetupView,
      meta: { public: true },
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/test',
      name: 'test',
      component: TestView,
      meta: { requiresAuth: true },
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsList,
      meta: { requiresAuth: true },
    },
    {
      path: '/products/create',
      name: 'products-create',
      component: ProductsCreate,
      meta: { requiresAuth: true },
    },
    {
      path: '/products/edit/:id',
      name: 'products-edit',
      component: ProductsEdit,
      meta: { requiresAuth: true },
    },
    {
      path: '/pricings',
      name: 'pricings',
      component: PricingsList,
      meta: { requiresAuth: true },
    },
    {
      path: '/pricings/create',
      name: 'pricings-create',
      component: PricingsCreate,
      meta: { requiresAuth: true },
    },
    {
      path: '/pricings/edit/:id',
      name: 'pricings-edit',
      component: PricingsEdit,
      meta: { requiresAuth: true },
    },
    {
      path: '/inventories',
      name: 'inventories',
      component: InventoriesList,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/inventories/create',
      name: 'inventories-create',
      component: InventoriesCreate,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/inventories/edit/:id',
      name: 'inventories-edit',
      component: InventoriesEdit,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/costs',
      name: 'costs',
      component: CostsList,
      meta: { requiresAuth: true },
    },
    {
      path: '/costs/create',
      name: 'costs-create',
      component: CostsCreate,
      meta: { requiresAuth: true },
    },
    {
      path: '/costs/edit/:id',
      name: 'costs-edit',
      component: CostsEdit,
      meta: { requiresAuth: true },
    },
    {
      path: '/cost-categories',
      name: 'cost-categories',
      component: CostCategoriesList,
      meta: { requiresAuth: true },
    },
    {
      path: '/cost-categories/create',
      name: 'cost-categories-create',
      component: CostCategoriesCreate,
      meta: { requiresAuth: true },
    },
    {
      path: '/cost-categories/edit/:id',
      name: 'cost-categories-edit',
      component: CostCategoriesEdit,
      meta: { requiresAuth: true },
    },
    {
      path: '/clients',
      name: 'clients',
      component: ClientsList,
      meta: { requiresAuth: true },
    },
    {
      path: '/clients/create',
      name: 'clients-create',
      component: ClientsCreate,
      meta: { requiresAuth: true },
    },
    {
      path: '/clients/edit/:id',
      name: 'clients-edit',
      component: ClientsEdit,
      meta: { requiresAuth: true },
    },
    {
      path: '/sales',
      name: 'sales',
      component: SalesList,
      meta: { requiresAuth: true },
    },
    {
      path: '/sales/create',
      name: 'sales-create',
      component: SalesCreate,
      meta: { requiresAuth: true },
    },
    {
      path: '/purchases',
      name: 'purchases',
      component: PurchasesList,
      meta: { requiresAuth: true },
    },
    {
      path: '/purchases/create',
      name: 'purchases-create',
      component: PurchasesCreate,
      meta: { requiresAuth: true },
    },
    {
      path: '/stocks',
      name: 'stocks',
      component: StocksList,
      meta: { requiresAuth: true },
    },
    {
      path: '/users',
      name: 'users',
      component: UsersList,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/config',
      name: 'config',
      component: ConfigEdit,
      meta: { requiresAuth: true },
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportsIndex,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore(pinia)
  await auth.init()

  if (auth.bootstrapRequired && to.name !== 'setup') {
    return { name: 'setup' }
  }

  if (!auth.bootstrapRequired && to.name === 'setup') {
    return auth.isAuthenticated ? { name: 'home' } : { name: 'login' }
  }

  if (to.meta.public && auth.isAuthenticated) {
    return { name: 'home' }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'home' }
  }

  return true
})

export default router
