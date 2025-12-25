<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@widgets/header/ui/Header.vue'
import { LunchCard } from '@entities/lunch'
import { useUser, useLunches } from '@shared/api'
import { useModalStore } from '@widgets/modal-container'
import { LunchDetailModal } from '@features/lunch'

const route = useRoute()
const modalStore = useModalStore()
const userId = computed(() => Number(route.params.id))

const { data: user, isLoading: isLoadingUser } = useUser(userId)

const lunchQuery = computed(() => ({ userId: userId.value }))
const { data: lunchesData, isLoading: isLoadingLunches } = useLunches(lunchQuery)
const lunches = computed(() => lunchesData.value?.data ?? [])

function openLunchModal(lunchId: number) {
  modalStore.open({
    component: LunchDetailModal,
    props: { lunchId },
  })
}
</script>

<template>
  <div class="min-h-screen">
    <Header />

    <main class="container mx-auto px-4 py-8">
      <div v-if="isLoadingUser" class="text-muted-foreground">
        Загрузка...
      </div>

      <template v-else-if="user">
        <div class="mb-8 flex items-center gap-6">
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h1 class="text-3xl font-bold">{{ user.name }}</h1>
            <p class="text-muted-foreground">Обеды пользователя</p>
          </div>
        </div>

        <div v-if="isLoadingLunches" class="flex items-center justify-center py-16">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>

        <div v-else-if="lunches.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <LunchCard
            v-for="lunch in lunches"
            :key="lunch.id"
            :lunch="lunch"
            @click="openLunchModal(lunch.id)"
          />
        </div>

        <div v-else class="py-16 text-center text-muted-foreground">
          У пользователя пока нет обедов
        </div>
      </template>
    </main>
  </div>
</template>
