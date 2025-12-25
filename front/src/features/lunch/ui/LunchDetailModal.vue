<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useLunch, useDeleteLunch, useUploadLunchImage, useDeleteLunchImage, useUpdateLunch, useUser } from '@shared/api'
import { useModalStore } from '@widgets/modal-container'
import { useSessionStore } from '@entities/session'
import { useCartStore } from '@features/cart'

const props = defineProps<{
  lunchId: number
}>()

const modalStore = useModalStore()
const sessionStore = useSessionStore()
const cartStore = useCartStore()

const { data: lunch, isLoading } = useLunch(() => props.lunchId)
const deleteLunch = useDeleteLunch()
const uploadImage = useUploadLunchImage()
const deleteImage = useDeleteLunchImage()
const updateLunch = useUpdateLunch()

const fileInput = ref<HTMLInputElement>()
const lightboxImage = ref<string | null>(null)
const isEditMode = ref(false)

// Edit form state
const editForm = ref({
  title: '',
  recipe: '',
  difficulty: '' as 'EASY' | 'MEDIUM' | 'HARD' | '',
  calories: null as number | null,
  proteins: null as number | null,
  fats: null as number | null,
  carbs: null as number | null,
  cookingTime: null as number | null,
})

// Sync form with lunch data when entering edit mode
watch(isEditMode, (editing) => {
  if (editing && lunch.value) {
    editForm.value = {
      title: lunch.value.title || '',
      recipe: lunch.value.recipe || '',
      difficulty: lunch.value.difficulty || '',
      calories: lunch.value.calories,
      proteins: lunch.value.proteins,
      fats: lunch.value.fats,
      carbs: lunch.value.carbs,
      cookingTime: lunch.value.cookingTime,
    }
  }
})

const isOwner = computed(() => lunch.value?.userId === sessionStore.user?.id)
const isInCart = computed(() => cartStore.isInCart(props.lunchId))
const canAddToCart = computed(() => !isOwner.value && !isInCart.value)

const { data: chefData } = useUser(computed(() => lunch.value?.userId ?? 0))

function addToCart() {
  if (!lunch.value || !chefData.value) return

  cartStore.addItem({
    lunchId: lunch.value.id,
    lunchTitle: lunch.value.title,
    lunchImage: lunch.value.images[0]?.url || null,
    chefId: chefData.value.id,
    chefName: chefData.value.name,
  })
}

const difficultyLabels = {
  EASY: 'Легко',
  MEDIUM: 'Средне',
  HARD: 'Сложно',
}

async function handleDelete() {
  if (!confirm('Удалить этот обед?')) return

  try {
    await deleteLunch.mutateAsync(props.lunchId)
    modalStore.close()
  } catch (e) {
    console.error('Delete failed', e)
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    await uploadImage.mutateAsync({ lunchId: props.lunchId, file })
  } catch (e) {
    console.error('Upload failed', e)
  }

  input.value = ''
}

async function handleDeleteImage(imageId: number) {
  if (!confirm('Удалить это изображение?')) return

  try {
    await deleteImage.mutateAsync({ lunchId: props.lunchId, imageId })
  } catch (e) {
    console.error('Delete image failed', e)
  }
}

async function handleSave() {
  try {
    await updateLunch.mutateAsync({
      id: props.lunchId,
      dto: {
        title: editForm.value.title || undefined,
        recipe: editForm.value.recipe || undefined,
        difficulty: editForm.value.difficulty || undefined,
        calories: editForm.value.calories ?? undefined,
        proteins: editForm.value.proteins ?? undefined,
        fats: editForm.value.fats ?? undefined,
        carbs: editForm.value.carbs ?? undefined,
        cookingTime: editForm.value.cookingTime ?? undefined,
      },
    })
    isEditMode.value = false
  } catch (e) {
    console.error('Save failed', e)
  }
}
</script>

<template>
  <div class="w-full max-w-2xl">
    <div v-if="isLoading" class="flex items-center justify-center py-16">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>

    <template v-else-if="lunch">
      <div class="mb-6 flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <input
            v-if="isEditMode"
            v-model="editForm.title"
            type="text"
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-2xl font-bold focus:border-primary focus:outline-none"
            placeholder="Название"
          />
          <h2 v-else class="text-2xl font-bold">{{ lunch.title }}</h2>

          <div class="mt-2">
            <select
              v-if="isEditMode"
              v-model="editForm.difficulty"
              class="rounded-full border border-border bg-background px-3 py-1 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">Без сложности</option>
              <option value="EASY">Легко</option>
              <option value="MEDIUM">Средне</option>
              <option value="HARD">Сложно</option>
            </select>
            <span
              v-else-if="lunch.difficulty"
              :class="[
                'inline-block rounded-full px-3 py-1 text-sm font-medium',
                lunch.difficulty === 'EASY' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                lunch.difficulty === 'MEDIUM' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                lunch.difficulty === 'HARD' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
              ]"
            >
              {{ difficultyLabels[lunch.difficulty] }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="isOwner && !isEditMode"
            class="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
            @click="isEditMode = true"
          >
            Редактировать
          </button>
          <button
            v-if="isEditMode"
            class="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
            :disabled="updateLunch.isPending.value"
            @click="isEditMode = false"
          >
            Отмена
          </button>
          <button
            v-if="isEditMode"
            class="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            :disabled="updateLunch.isPending.value"
            @click="handleSave"
          >
            {{ updateLunch.isPending.value ? 'Сохранение...' : 'Сохранить' }}
          </button>
          <button
            class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary"
            @click="modalStore.close()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="mb-4">
        <div v-if="lunch.images.length" class="space-y-2">
          <div
            class="group relative cursor-pointer overflow-hidden rounded-xl"
            @click="lightboxImage = lunch.images[0].url"
          >
            <img
              :src="lunch.images[0].url"
              :alt="lunch.title"
              class="max-h-64 w-full object-cover rounded-xl transition-transform hover:scale-[1.02]"
            />
            <button
              v-if="isEditMode"
              class="absolute right-2 top-2 rounded-lg bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
              :disabled="deleteImage.isPending.value"
              @click.stop="handleDeleteImage(lunch.images[0].id)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <div v-if="lunch.images.length > 1" class="grid grid-cols-4 gap-2">
            <div
              v-for="img in lunch.images.slice(1)"
              :key="img.id"
              class="group relative cursor-pointer overflow-hidden rounded-lg"
              @click="lightboxImage = img.url"
            >
              <img
                :src="img.url"
                :alt="lunch.title"
                class="h-20 w-full object-cover transition-transform hover:scale-105"
              />
              <button
                v-if="isEditMode"
                class="absolute right-1 top-1 rounded bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                :disabled="deleteImage.isPending.value"
                @click.stop="handleDeleteImage(img.id)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileSelect"
        />

        <button
          v-if="isEditMode"
          class="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-6 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          :disabled="uploadImage.isPending.value"
          @click="triggerFileInput"
        >
          <svg v-if="!uploadImage.isPending.value" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
          </svg>
          <div v-else class="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {{ uploadImage.isPending.value ? 'Загрузка...' : 'Добавить изображение' }}
        </button>
      </div>

      <div v-if="lunch.tags.length" class="mb-4 flex flex-wrap gap-2">
        <span
          v-for="tag in lunch.tags"
          :key="tag"
          class="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
        >
          {{ tag }}
        </span>
      </div>

      <div v-if="isEditMode || lunch.calories || lunch.proteins || lunch.fats || lunch.carbs || lunch.cookingTime" class="mb-6 grid grid-cols-2 gap-4 rounded-xl bg-secondary/50 p-4 sm:grid-cols-5">
        <div class="text-center">
          <template v-if="isEditMode">
            <input
              v-model.number="editForm.calories"
              type="number"
              class="w-full rounded border border-border bg-background px-2 py-1 text-center text-lg font-bold focus:border-primary focus:outline-none"
              placeholder="—"
            />
          </template>
          <div v-else class="text-2xl font-bold text-primary">{{ lunch.calories || '—' }}</div>
          <div class="text-sm text-muted-foreground">ккал</div>
        </div>
        <div class="text-center">
          <template v-if="isEditMode">
            <input
              v-model.number="editForm.proteins"
              type="number"
              class="w-full rounded border border-border bg-background px-2 py-1 text-center text-lg font-bold focus:border-primary focus:outline-none"
              placeholder="—"
            />
          </template>
          <div v-else class="text-2xl font-bold">{{ lunch.proteins ? `${lunch.proteins}г` : '—' }}</div>
          <div class="text-sm text-muted-foreground">белки</div>
        </div>
        <div class="text-center">
          <template v-if="isEditMode">
            <input
              v-model.number="editForm.fats"
              type="number"
              class="w-full rounded border border-border bg-background px-2 py-1 text-center text-lg font-bold focus:border-primary focus:outline-none"
              placeholder="—"
            />
          </template>
          <div v-else class="text-2xl font-bold">{{ lunch.fats ? `${lunch.fats}г` : '—' }}</div>
          <div class="text-sm text-muted-foreground">жиры</div>
        </div>
        <div class="text-center">
          <template v-if="isEditMode">
            <input
              v-model.number="editForm.carbs"
              type="number"
              class="w-full rounded border border-border bg-background px-2 py-1 text-center text-lg font-bold focus:border-primary focus:outline-none"
              placeholder="—"
            />
          </template>
          <div v-else class="text-2xl font-bold">{{ lunch.carbs ? `${lunch.carbs}г` : '—' }}</div>
          <div class="text-sm text-muted-foreground">углеводы</div>
        </div>
        <div class="text-center">
          <template v-if="isEditMode">
            <input
              v-model.number="editForm.cookingTime"
              type="number"
              class="w-full rounded border border-border bg-background px-2 py-1 text-center text-lg font-bold focus:border-primary focus:outline-none"
              placeholder="—"
            />
          </template>
          <div v-else class="text-2xl font-bold">{{ lunch.cookingTime || '—' }}</div>
          <div class="text-sm text-muted-foreground">мин</div>
        </div>
      </div>

      <div v-if="isEditMode || lunch.recipe" class="prose prose-sm max-w-none dark:prose-invert">
        <h3 class="text-lg font-semibold">Рецепт</h3>
        <textarea
          v-if="isEditMode"
          v-model="editForm.recipe"
          rows="8"
          class="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
          placeholder="Опишите рецепт..."
        />
        <div v-else class="whitespace-pre-wrap text-muted-foreground">{{ lunch.recipe }}</div>
      </div>

      <div v-if="!isEditMode && !isOwner" class="mt-6 border-t border-border pt-4">
        <button
          v-if="canAddToCart"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          @click="addToCart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          В корзину
        </button>
        <div
          v-else-if="isInCart"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-green-100 py-3 font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          В корзине
        </div>
      </div>

      <div v-if="isEditMode" class="mt-6 flex justify-end gap-3 border-t border-border pt-4">
        <button
          class="rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
          :disabled="deleteLunch.isPending.value"
          @click="handleDelete"
        >
          {{ deleteLunch.isPending.value ? 'Удаление...' : 'Удалить' }}
        </button>
      </div>
    </template>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="lightboxImage"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          @click="lightboxImage = null"
        >
          <button
            class="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            @click="lightboxImage = null"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            :src="lightboxImage"
            class="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            @click.stop
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
