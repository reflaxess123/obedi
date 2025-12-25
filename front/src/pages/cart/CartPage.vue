<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@features/cart'
import { useCreateOrder } from '@shared/api'

const router = useRouter()
const cartStore = useCartStore()
const createOrder = useCreateOrder()

const isOrdering = ref(false)
const orderingChefId = ref<number | null>(null)

async function handleOrder(chefId: number) {
  const items = cartStore.getChefItems(chefId)
  if (items.length === 0) return

  isOrdering.value = true
  orderingChefId.value = chefId

  try {
    await createOrder.mutateAsync({
      chefId,
      lunchIds: items.map((i) => i.lunchId),
    })
    cartStore.removeChefItems(chefId)
  } catch (e) {
    console.error('Order failed', e)
  } finally {
    isOrdering.value = false
    orderingChefId.value = null
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="mb-8 text-3xl font-bold">Корзина</h1>

    <div v-if="cartStore.isEmpty" class="rounded-xl bg-secondary/50 p-12 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto mb-4 h-16 w-16 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <p class="text-lg text-muted-foreground">Корзина пуста</p>
      <p class="mt-2 text-sm text-muted-foreground">Добавьте рецепты, чтобы сделать заказ</p>
      <button
        class="mt-6 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        @click="router.push('/')"
      >
        К рецептам
      </button>
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="group in cartStore.itemsByChef"
        :key="group.chef.id"
        class="rounded-xl border border-border bg-card p-6"
      >
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {{ group.chef.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h2 class="font-semibold">{{ group.chef.name }}</h2>
              <p class="text-sm text-muted-foreground">{{ group.items.length }} рецепт(ов)</p>
            </div>
          </div>
          <button
            class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            :disabled="isOrdering && orderingChefId === group.chef.id"
            @click="handleOrder(group.chef.id)"
          >
            {{ isOrdering && orderingChefId === group.chef.id ? 'Отправка...' : 'Заказать' }}
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="item in group.items"
            :key="item.lunchId"
            class="flex items-center gap-4 rounded-lg bg-secondary/50 p-3"
          >
            <img
              v-if="item.lunchImage"
              :src="item.lunchImage"
              :alt="item.lunchTitle"
              class="h-16 w-16 rounded-lg object-cover"
            />
            <div v-else class="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-medium">{{ item.lunchTitle }}</h3>
            </div>
            <button
              class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              @click="cartStore.removeItem(item.lunchId)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          class="text-sm text-muted-foreground transition-colors hover:text-destructive"
          @click="cartStore.clearCart()"
        >
          Очистить корзину
        </button>
      </div>
    </div>
  </div>
</template>
