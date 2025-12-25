<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOrders, useUpdateOrderStatus } from '@shared/api'
import type { OrderStatus } from '@shared/types'
const activeTab = ref<'incoming' | 'outgoing'>('incoming')

const { data: incomingOrders, isLoading: loadingIncoming } = useOrders(
  computed(() => ({ role: 'chef' as const }))
)
const { data: outgoingOrders, isLoading: loadingOutgoing } = useOrders(
  computed(() => ({ role: 'customer' as const }))
)

const updateStatus = useUpdateOrderStatus()

const activeOrders = computed(() => {
  const orders = activeTab.value === 'incoming' ? incomingOrders.value : outgoingOrders.value
  return orders?.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status)) || []
})

const isLoading = computed(() =>
  activeTab.value === 'incoming' ? loadingIncoming.value : loadingOutgoing.value
)

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Ожидает',
  ACCEPTED: 'Принят',
  COOKING: 'Готовится',
  READY: 'Готов',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  ACCEPTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  COOKING: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  READY: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  DELIVERED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'ACCEPTED',
  ACCEPTED: 'COOKING',
  COOKING: 'READY',
  READY: 'DELIVERED',
}

const nextStatusLabel: Partial<Record<OrderStatus, string>> = {
  PENDING: 'Принять',
  ACCEPTED: 'Начать готовить',
  COOKING: 'Готово',
  READY: 'Выдано',
}

async function handleUpdateStatus(orderId: number, status: OrderStatus) {
  await updateStatus.mutateAsync({ id: orderId, dto: { status } })
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="mb-8 text-3xl font-bold">Заказы</h1>

    <div class="mb-6 flex gap-2">
      <button
        :class="[
          'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
          activeTab === 'incoming'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-foreground hover:bg-secondary/80',
        ]"
        @click="activeTab = 'incoming'"
      >
        Входящие (мне заказали)
      </button>
      <button
        :class="[
          'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
          activeTab === 'outgoing'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-foreground hover:bg-secondary/80',
        ]"
        @click="activeTab = 'outgoing'"
      >
        Исходящие (я заказал)
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>

    <div v-else-if="activeOrders.length === 0" class="rounded-xl bg-secondary/50 p-12 text-center">
      <p class="text-lg text-muted-foreground">Нет активных заказов</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="order in activeOrders"
        :key="order.id"
        class="rounded-xl border border-border bg-card p-6"
      >
        <div class="mb-4 flex items-start justify-between">
          <div>
            <div class="flex items-center gap-3">
              <span :class="['rounded-full px-3 py-1 text-sm font-medium', statusColors[order.status]]">
                {{ statusLabels[order.status] }}
              </span>
              <span class="text-sm text-muted-foreground">
                #{{ order.id }}
              </span>
            </div>
            <div class="mt-2 text-sm text-muted-foreground">
              <template v-if="activeTab === 'incoming'">
                От: <span class="font-medium text-foreground">{{ order.customer.name }}</span>
              </template>
              <template v-else>
                Повару: <span class="font-medium text-foreground">{{ order.chef.name }}</span>
              </template>
            </div>
          </div>

          <div v-if="activeTab === 'incoming' && nextStatus[order.status]" class="flex gap-2">
            <button
              class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              :disabled="updateStatus.isPending.value"
              @click="handleUpdateStatus(order.id, nextStatus[order.status]!)"
            >
              {{ nextStatusLabel[order.status] }}
            </button>
            <button
              v-if="order.status === 'PENDING'"
              class="rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
              :disabled="updateStatus.isPending.value"
              @click="handleUpdateStatus(order.id, 'CANCELLED')"
            >
              Отклонить
            </button>
          </div>

          <button
            v-if="activeTab === 'outgoing' && order.status === 'PENDING'"
            class="rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
            :disabled="updateStatus.isPending.value"
            @click="handleUpdateStatus(order.id, 'CANCELLED')"
          >
            Отменить
          </button>
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

        <div class="mt-4 text-xs text-muted-foreground">
          {{ new Date(order.createdAt).toLocaleString('ru') }}
        </div>
      </div>
    </div>
  </div>
</template>
