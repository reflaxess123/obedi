<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSessionStore } from '@entities/session'

const router = useRouter()
const route = useRoute()
const sessionStore = useSessionStore()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

async function handleSubmit() {
  error.value = ''
  isLoading.value = true

  try {
    await sessionStore.login(email.value, password.value)
    const redirect = route.query.redirect as string || '/'
    router.push(redirect)
  } catch (e: unknown) {
    error.value = (e as { message?: string })?.message || 'Ошибка входа'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background px-4">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-primary">Obedi</h1>
        <p class="mt-2 text-muted-foreground">Войдите в аккаунт</p>
      </div>

      <form
        class="rounded-2xl border border-border bg-card p-8 shadow-lg"
        @submit.prevent="handleSubmit"
      >
        <div v-if="error" class="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {{ error }}
        </div>

        <div class="space-y-4">
          <div>
            <label for="email" class="mb-2 block text-sm font-medium">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label for="password" class="mb-2 block text-sm font-medium">Пароль</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="mt-6 w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {{ isLoading ? 'Вход...' : 'Войти' }}
        </button>

        <p class="mt-6 text-center text-sm text-muted-foreground">
          Нет аккаунта?
          <RouterLink to="/auth/register" class="font-medium text-primary hover:underline">
            Зарегистрироваться
          </RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>
