import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useSessionStore } from '@entities/session'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@pages/home/HomePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@pages/profile/ProfilePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@pages/users/UsersPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/users/:id',
    name: 'user',
    component: () => import('@pages/user/UserPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@pages/cart/CartPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('@pages/orders/OrdersPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('@pages/history/HistoryPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/auth/login',
    name: 'login',
    component: () => import('@pages/auth/LoginPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/auth/register',
    name: 'register',
    component: () => import('@pages/auth/RegisterPage.vue'),
    meta: { guestOnly: true },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, _from, next) => {
  const sessionStore = useSessionStore()

  if (!sessionStore.user && localStorage.getItem('accessToken')) {
    await sessionStore.fetchCurrentUser()
  }

  if (to.meta.requiresAuth && !sessionStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.guestOnly && sessionStore.isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})
