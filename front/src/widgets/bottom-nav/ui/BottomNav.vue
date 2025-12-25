<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { useSessionStore } from '@entities/session'
import { useCartStore } from '@features/cart'

const route = useRoute()
const sessionStore = useSessionStore()
const cartStore = useCartStore()

function isActive(path: string) {
  return route.path === path
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm md:hidden">
    <div class="flex h-16 items-center justify-around px-1">
      <RouterLink
        to="/"
        class="flex flex-col items-center gap-0.5 px-2 py-1"
        :class="isActive('/') ? 'text-primary' : 'text-muted-foreground'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" :stroke-width="isActive('/') ? 2.5 : 2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-xs">Рецепты</span>
      </RouterLink>

      <RouterLink
        to="/users"
        class="flex flex-col items-center gap-0.5 px-2 py-1"
        :class="isActive('/users') || route.path.startsWith('/users/') ? 'text-primary' : 'text-muted-foreground'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" :stroke-width="isActive('/users') ? 2.5 : 2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span class="text-xs">Повара</span>
      </RouterLink>

      <template v-if="sessionStore.isAuthenticated">
        <RouterLink
          to="/cart"
          class="relative flex flex-col items-center gap-0.5 px-2 py-1"
          :class="isActive('/cart') ? 'text-primary' : 'text-muted-foreground'"
        >
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" :stroke-width="isActive('/cart') ? 2.5 : 2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span
              v-if="cartStore.totalCount > 0"
              class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
            >
              {{ cartStore.totalCount }}
            </span>
          </div>
          <span class="text-xs">Корзина</span>
        </RouterLink>

        <RouterLink
          to="/orders"
          class="flex flex-col items-center gap-0.5 px-2 py-1"
          :class="isActive('/orders') ? 'text-primary' : 'text-muted-foreground'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" :stroke-width="isActive('/orders') ? 2.5 : 2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span class="text-xs">Заказы</span>
        </RouterLink>

        <RouterLink
          to="/history"
          class="flex flex-col items-center gap-0.5 px-2 py-1"
          :class="isActive('/history') ? 'text-primary' : 'text-muted-foreground'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" :stroke-width="isActive('/history') ? 2.5 : 2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-xs">История</span>
        </RouterLink>

        <RouterLink
          to="/profile"
          class="flex flex-col items-center gap-0.5 px-2 py-1"
          :class="isActive('/profile') ? 'text-primary' : 'text-muted-foreground'"
        >
          <div
            class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium"
            :class="isActive('/profile') ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'"
          >
            {{ sessionStore.user?.name?.charAt(0).toUpperCase() }}
          </div>
          <span class="text-xs">Профиль</span>
        </RouterLink>
      </template>

      <template v-else>
        <RouterLink
          to="/auth/login"
          class="flex flex-col items-center gap-0.5 px-2 py-1"
          :class="isActive('/auth/login') ? 'text-primary' : 'text-muted-foreground'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" :stroke-width="isActive('/auth/login') ? 2.5 : 2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span class="text-xs">Войти</span>
        </RouterLink>

        <RouterLink
          to="/auth/register"
          class="flex flex-col items-center gap-0.5 px-2 py-1"
          :class="isActive('/auth/register') ? 'text-primary' : 'text-muted-foreground'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" :stroke-width="isActive('/auth/register') ? 2.5 : 2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span class="text-xs">Регистрация</span>
        </RouterLink>
      </template>
    </div>
  </nav>
</template>
