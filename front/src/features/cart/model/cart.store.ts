import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
  lunchId: number
  lunchTitle: string
  lunchImage: string | null
  chefId: number
  chefName: string
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadFromStorage())

  // Group items by chef
  const itemsByChef = computed(() => {
    const grouped = new Map<number, { chef: { id: number; name: string }; items: CartItem[] }>()

    for (const item of items.value) {
      if (!grouped.has(item.chefId)) {
        grouped.set(item.chefId, {
          chef: { id: item.chefId, name: item.chefName },
          items: [],
        })
      }
      grouped.get(item.chefId)!.items.push(item)
    }

    return Array.from(grouped.values())
  })

  const totalCount = computed(() => items.value.length)

  const isEmpty = computed(() => items.value.length === 0)

  function addItem(item: CartItem) {
    // Check if already in cart
    if (items.value.some((i) => i.lunchId === item.lunchId)) {
      return false
    }
    items.value.push(item)
    saveToStorage()
    return true
  }

  function removeItem(lunchId: number) {
    items.value = items.value.filter((i) => i.lunchId !== lunchId)
    saveToStorage()
  }

  function removeChefItems(chefId: number) {
    items.value = items.value.filter((i) => i.chefId !== chefId)
    saveToStorage()
  }

  function clearCart() {
    items.value = []
    saveToStorage()
  }

  function isInCart(lunchId: number) {
    return items.value.some((i) => i.lunchId === lunchId)
  }

  function getChefItems(chefId: number) {
    return items.value.filter((i) => i.chefId === chefId)
  }

  function saveToStorage() {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  function loadFromStorage(): CartItem[] {
    try {
      const data = localStorage.getItem('cart')
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  return {
    items,
    itemsByChef,
    totalCount,
    isEmpty,
    addItem,
    removeItem,
    removeChefItems,
    clearCart,
    isInCart,
    getChefItems,
  }
})
