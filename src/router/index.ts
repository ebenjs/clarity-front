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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/test',
      name: 'test',
      component: TestView,
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsList,
    },
    {
      path: '/products/create',
      name: 'products-create',
      component: ProductsCreate,
    },
    {
      path: '/products/edit/:id',
      name: 'products-edit',
      component: ProductsEdit,
    },
    {
      path: '/pricings',
      name: 'pricings',
      component: PricingsList,
    },
    {
      path: '/pricings/create',
      name: 'pricings-create',
      component: PricingsCreate,
    },
    {
      path: '/pricings/edit/:id',
      name: 'pricings-edit',
      component: PricingsEdit,
    },
    {
      path: '/inventories',
      name: 'inventories',
      component: InventoriesList,
    },
    {
      path: '/inventories/create',
      name: 'inventories-create',
      component: InventoriesCreate,
    },
    {
      path: '/inventories/edit/:id',
      name: 'inventories-edit',
      component: InventoriesEdit,
    },
    {
      path: '/costs',
      name: 'costs',
      component: CostsList,
    },
    {
      path: '/costs/create',
      name: 'costs-create',
      component: CostsCreate,
    },
    {
      path: '/costs/edit/:id',
      name: 'costs-edit',
      component: CostsEdit,
    },
    {
      path: '/cost-categories',
      name: 'cost-categories',
      component: CostCategoriesList,
    },
    {
      path: '/cost-categories/create',
      name: 'cost-categories-create',
      component: CostCategoriesCreate,
    },
    {
      path: '/cost-categories/edit/:id',
      name: 'cost-categories-edit',
      component: CostCategoriesEdit,
    },
    {
      path: '/clients',
      name: 'clients',
      component: ClientsList,
    },
    {
      path: '/clients/create',
      name: 'clients-create',
      component: ClientsCreate,
    },
    {
      path: '/clients/edit/:id',
      name: 'clients-edit',
      component: ClientsEdit,
    },
    {
      path: '/sales',
      name: 'sales',
      component: SalesList,
    },
    {
      path: '/sales/create',
      name: 'sales-create',
      component: SalesCreate,
    },
    {
      path: '/purchases',
      name: 'purchases',
      component: PurchasesList,
    },
    {
      path: '/purchases/create',
      name: 'purchases-create',
      component: PurchasesCreate,
    },
    {
      path: '/stocks',
      name: 'stocks',
      component: StocksList,
    },
    {
      path: '/config',
      name: 'config',
      component: ConfigEdit,
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportsIndex,
    },
  ],
})

export default router
