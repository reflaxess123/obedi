<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@entities/session'

const router = useRouter()
const sessionStore = useSessionStore()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

async function handleSubmit() {
  error.value = ''
  isLoading.value = true

  try {
    await sessionStore.register(email.value, password.value, name.value)
    router.push('/')
  } catch (e: unknown) {
    error.value = (e as { message?: string })?.message || 'Ошибка регистрации'
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
        <p class="mt-2 text-muted-foreground">Создайте аккаунт</p>
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
            <label for="name" class="mb-2 block text-sm font-medium">Имя</label>
            <input
              id="name"
              v-model="name"
              type="text"
              required
              class="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="Ваше имя"
            />
          </div>

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
              minlength="6"
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
          {{ isLoading ? 'Создание...' : 'Создать аккаунт' }}
        </button>

        <p class="mt-6 text-center text-sm text-muted-foreground">
          Уже есть аккаунт?
          <RouterLink to="/auth/login" class="font-medium text-primary hover:underline">
            Войти
          </RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>
