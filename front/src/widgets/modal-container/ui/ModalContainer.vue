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
    <Transition name="overlay">
      <div
        v-if="modalStore.hasModals"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <!-- Overlay -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="modalStore.close()"
        />

        <!-- Modal stack -->
        <TransitionGroup name="modal">
          <div
            v-for="(modal, index) in modalStore.stack"
            :key="modal.id"
            class="absolute flex items-center justify-center"
            :style="{ zIndex: 51 + index }"
            @click.stop
          >
            <!-- Stacking effect wrapper -->
            <div
              :style="{
                transform: index < modalStore.stack.length - 1
                  ? `scale(${1 - (modalStore.stack.length - 1 - index) * 0.05})`
                  : undefined,
                opacity: index === modalStore.stack.length - 1 ? 1 : 0.5,
                transition: 'transform 0.2s, opacity 0.2s',
              }"
            >
              <div class="max-h-[90vh] max-w-[95vw] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
                <component
                  :is="modal.component"
                  v-bind="modal.props"
                  @close="modalStore.close(modal.id)"
                />
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Overlay animation */
.overlay-enter-active {
  transition: opacity 0.25s ease-out;
}
.overlay-leave-active {
  transition: opacity 0.2s ease-in;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Modal animation */
.modal-enter-active {
  transition: opacity 0.25s ease-out, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-leave-active {
  transition: opacity 0.15s ease-in, transform 0.15s ease-in;
}
.modal-enter-from {
  opacity: 0;
  transform: scale(0.92);
}
.modal-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
