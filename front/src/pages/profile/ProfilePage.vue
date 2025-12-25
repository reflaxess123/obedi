<script setup lang="ts">
import { useSessionStore } from '@entities/session'
import Header from '@widgets/header/ui/Header.vue'

const sessionStore = useSessionStore()
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
          <h3 class="mb-4 text-lg font-semibold">Настройки профиля</h3>
          <p class="text-muted-foreground">Редактирование профиля будет доступно позже</p>
        </div>
      </div>
    </main>
  </div>
</template>
