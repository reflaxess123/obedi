<script setup lang="ts">
import { useModalStore } from '../model/store'
import { onKeyDown } from '@vueuse/core'

const modalStore = useModalStore()

onKeyDown('Escape', () => {
  modalStore.close()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div
        v-if="modalStore.hasModals"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="modalStore.close()"
        />

        <TransitionGroup name="modal" tag="div" class="flex items-center justify-center">
          <div
            v-for="(modal, index) in modalStore.stack"
            :key="modal.id"
            class="absolute"
            :style="{
              zIndex: 51 + index,
              transform: `scale(${1 - (modalStore.stack.length - 1 - index) * 0.05})`,
              opacity: index === modalStore.stack.length - 1 ? 1 : 0.5,
            }"
            @click.stop
          >
            <div class="max-h-[90vh] max-w-[95vw] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
              <component
                :is="modal.component"
                v-bind="modal.props"
                @close="modalStore.close(modal.id)"
              />
            </div>
          </div>
        </TransitionGroup>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

.modal-enter-active {
  transition: all 0.2s ease;
}

.modal-leave-active {
  transition: all 0.15s ease;
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>
