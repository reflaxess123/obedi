<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSessionStore } from '@entities/session'
import { useThemeStore } from '@features/theme-toggle'
import { useCartStore } from '@features/cart'
import Header from '@widgets/header/ui/Header.vue'

const router = useRouter()
const sessionStore = useSessionStore()
const themeStore = useThemeStore()
const cartStore = useCartStore()

async function handleLogout() {
  await sessionStore.logout()
  cartStore.clearCart()
  router.push('/auth/login')
}
</script>

<template>
  <div class="min-h-screen">
    <Header />

    <main class="container mx-auto px-4 py-8">
      <h1 class="mb-8 text-3xl font-bold">Мой профиль</h1>

      <div v-if="sessionStore.user" class="max-w-2xl rounded-2xl border border-border bg-card p-8">
        <div class="flex items-center gap-6">
          <div class="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
            {{ sessionStore.user.name.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h2 class="text-2xl font-bold">{{ sessionStore.user.name }}</h2>
            <p class="text-muted-foreground">{{ sessionStore.user.email }}</p>
            <span class="mt-2 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium">
              {{ sessionStore.user.provider === 'GOOGLE' ? 'Google' : 'Email' }}
            </span>
          </div>
        </div>

        <div class="mt-8 border-t border-border pt-8">
          <h3 class="mb-4 text-lg font-semibold">Настройки</h3>

          <div class="space-y-4">
            <!-- Theme Toggle -->
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Тема оформления</span>
              <button
                class="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                @click="themeStore.toggleTheme()"
              >
                <svg v-if="themeStore.theme === 'light'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg v-else-if="themeStore.theme === 'dark'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {{ themeStore.theme === 'light' ? 'Светлая' : themeStore.theme === 'dark' ? 'Тёмная' : 'Системная' }}
              </button>
            </div>

            <!-- Logout Button -->
            <button
              class="w-full rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
              @click="handleLogout"
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
