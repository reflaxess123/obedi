<script setup lang="ts">
import Header from '@widgets/header/ui/Header.vue'
import { useUsers } from '@shared/api'

const { data: users, isLoading } = useUsers()
</script>

<template>
  <div class="min-h-screen">
    <Header />

    <main class="container mx-auto px-4 py-8">
      <h1 class="mb-8 text-3xl font-bold">Пользователи</h1>

      <div v-if="isLoading" class="text-muted-foreground">
        Загрузка...
      </div>

      <div v-else-if="users" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="user in users"
          :key="user.id"
          :to="`/users/${user.id}`"
          class="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
          <div>
            <div class="font-semibold">{{ user.name }}</div>
            <div class="text-sm text-muted-foreground">{{ user.email }}</div>
          </div>
        </RouterLink>
      </div>
    </main>
  </div>
</template>
