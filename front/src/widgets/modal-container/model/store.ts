import { defineStore } from 'pinia'
import { ref, computed, type Component, markRaw } from 'vue'

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export interface ModalConfig {
  id: string
  component: Component
  props?: Record<string, unknown>
  onClose?: () => void
}

export const useModalStore = defineStore('modal', () => {
  const stack = ref<ModalConfig[]>([])

  const hasModals = computed(() => stack.value.length > 0)
  const currentModal = computed(() => stack.value[stack.value.length - 1] || null)

  function open(config: Omit<ModalConfig, 'id'>) {
    const id = generateId()
    stack.value.push({
      id,
      component: markRaw(config.component),
      props: config.props,
      onClose: config.onClose,
    })
    return id
  }

  function close(id?: string) {
    if (id) {
      const index = stack.value.findIndex((m) => m.id === id)
      if (index !== -1) {
        const modal = stack.value[index]
        if (modal) modal.onClose?.()
        stack.value.splice(index, 1)
      }
    } else if (stack.value.length > 0) {
      const modal = stack.value.pop()
      modal?.onClose?.()
    }
  }

  function closeAll() {
    stack.value.forEach((modal) => modal.onClose?.())
    stack.value = []
  }

  return {
    stack,
    hasModals,
    currentModal,
    open,
    close,
    closeAll,
  }
})
