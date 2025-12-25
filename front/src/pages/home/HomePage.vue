<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSessionStore } from '@entities/session'
import { LunchCard } from '@entities/lunch'
import Header from '@widgets/header/ui/Header.vue'
import { useLunches } from '@shared/api'
import { useModalStore } from '@widgets/modal-container'
import { CreateLunchModal, LunchDetailModal } from '@features/lunch'

const sessionStore = useSessionStore()
const modalStore = useModalStore()

const page = ref(1)
const query = computed(() => ({
  page: page.value,
  userId: sessionStore.user?.id,
}))

const { data: lunchesData, isLoading, isError } = useLunches(query)

const lunches = computed(() => lunchesData.value?.data ?? [])
const meta = computed(() => lunchesData.value?.meta)

function openCreateModal() {
  modalStore.open({
    component: CreateLunchModal,
    props: {},
  })
}

function openLunchModal(lunchId: number) {
  modalStore.open({
    component: LunchDetailModal,
    props: { lunchId },
  })
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <Header />

    <main class="container mx-auto px-4 py-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Мои обеды</h1>
          <p v-if="sessionStore.user" class="mt-1 text-muted-foreground">
            Привет, {{ sessionStore.user.name }}!
          </p>
        </div>
        <button
          v-if="sessionStore.isAuthenticated"
          class="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          @click="openCreateModal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Создать
        </button>
      </div>

      <div v-if="isLoading" class="flex items-center justify-center py-16">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>

      <div v-else-if="isError" class="rounded-xl bg-destructive/10 p-6 text-center text-destructive">
        Ошибка загрузки обедов. Попробуйте обновить страницу.
      </div>

      <div v-else-if="lunches.length === 0" class="py-16 text-center">
        <div class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h2 class="mb-2 text-xl font-semibold">Пока нет обедов</h2>
        <p class="mb-6 text-muted-foreground">Создайте свой первый обед и начните вести кулинарный дневник</p>
        <button
          v-if="sessionStore.isAuthenticated"
          class="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          @click="openCreateModal"
        >
          Создать первый обед
        </button>
        <RouterLink
          v-else
          to="/auth/login"
          class="inline-block rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Войти чтобы создать
        </RouterLink>
      </div>

      <template v-else>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <LunchCard
            v-for="lunch in lunches"
            :key="lunch.id"
            :lunch="lunch"
            @click="openLunchModal(lunch.id)"
          />
        </div>

        <div v-if="meta && meta.totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
          <button
            :disabled="page === 1"
            class="rounded-lg border border-border px-4 py-2 transition-colors hover:bg-secondary disabled:opacity-50"
            @click="page--"
          >
            Назад
          </button>
          <span class="px-4 text-muted-foreground">
            {{ page }} / {{ meta.totalPages }}
          </span>
          <button
            :disabled="page === meta.totalPages"
            class="rounded-lg border border-border px-4 py-2 transition-colors hover:bg-secondary disabled:opacity-50"
            @click="page++"
          >
            Вперед
          </button>
        </div>
      </template>
    </main>
  </div>
</template>
