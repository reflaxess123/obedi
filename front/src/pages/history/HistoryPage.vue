<script setup lang="ts">
import { useOrderHistory } from '@shared/api'
import { useSessionStore } from '@entities/session'
import type { OrderStatus } from '@shared/types'

const sessionStore = useSessionStore()
const { data: history, isLoading } = useOrderHistory()

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Ожидает',
  ACCEPTED: 'Принят',
  COOKING: 'Готовится',
  READY: 'Готов',
  DELIVERED: 'Выполнен',
  CANCELLED: 'Отменён',
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  ACCEPTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  COOKING: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  READY: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="mb-8 text-3xl font-bold">История заказов</h1>

    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>

    <div v-else-if="!history?.length" class="rounded-xl bg-secondary/50 p-12 text-center">
      <p class="text-lg text-muted-foreground">История пуста</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="order in history"
        :key="order.id"
        class="rounded-xl border border-border bg-card p-6"
      >
        <div class="mb-4 flex items-start justify-between">
          <div>
            <div class="flex items-center gap-3">
              <span :class="['rounded-full px-3 py-1 text-sm font-medium', statusColors[order.status]]">
                {{ statusLabels[order.status] }}
              </span>
              <span class="text-sm text-muted-foreground">#{{ order.id }}</span>
            </div>
            <div class="mt-2 text-sm">
              <template v-if="order.customer.id === sessionStore.user?.id">
                <span class="text-muted-foreground">Вы заказали у </span>
                <span class="font-medium">{{ order.chef.name }}</span>
              </template>
              <template v-else>
                <span class="font-medium">{{ order.customer.name }}</span>
                <span class="text-muted-foreground"> заказал у вас</span>
              </template>
            </div>
          </div>
          <div class="text-right text-sm text-muted-foreground">
            {{ new Date(order.updatedAt).toLocaleDateString('ru') }}
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2"
          >
            <img
              v-if="item.lunch.image"
              :src="item.lunch.image"
              :alt="item.lunch.title"
              class="h-8 w-8 rounded object-cover"
            />
            <span class="text-sm">{{ item.lunch.title }}</span>
          </div>
        </div>

        <details class="mt-4">
          <summary class="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            История статусов
          </summary>
          <div class="mt-2 space-y-1 border-l-2 border-border pl-4">
            <div
              v-for="h in order.history"
              :key="h.id"
              class="text-sm"
            >
              <span :class="['mr-2 rounded px-2 py-0.5 text-xs', statusColors[h.status]]">
                {{ statusLabels[h.status] }}
              </span>
              <span class="text-muted-foreground">
                {{ new Date(h.createdAt).toLocaleString('ru') }}
              </span>
              <span v-if="h.comment" class="ml-2 text-muted-foreground">— {{ h.comment }}</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>
