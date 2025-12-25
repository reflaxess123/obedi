<script setup lang="ts">
import { ref } from 'vue'
import { useCreateLunch, useUploadLunchImage } from '@shared/api'
import { useModalStore } from '@widgets/modal-container'
import type { CreateLunchDto } from '@shared/types'

const modalStore = useModalStore()
const createLunch = useCreateLunch()
const uploadImage = useUploadLunchImage()

const form = ref<CreateLunchDto>({
  title: '',
  recipe: '',
  calories: undefined,
  proteins: undefined,
  fats: undefined,
  carbs: undefined,
  cookingTime: undefined,
  difficulty: undefined,
  tags: [],
})

const tagInput = ref('')
const error = ref('')
const fileInput = ref<HTMLInputElement>()
const pendingImages = ref<{ file: File; preview: string }[]>([])

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files) return

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      pendingImages.value.push({
        file,
        preview: URL.createObjectURL(file),
      })
    }
  }

  input.value = ''
}

function removeImage(index: number) {
  URL.revokeObjectURL(pendingImages.value[index].preview)
  pendingImages.value.splice(index, 1)
}

function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags?.includes(tag)) {
    form.value.tags = [...(form.value.tags || []), tag]
    tagInput.value = ''
  }
}

function removeTag(tag: string) {
  form.value.tags = form.value.tags?.filter((t) => t !== tag)
}

const isUploading = ref(false)

async function handleSubmit() {
  error.value = ''

  if (!form.value.title.trim()) {
    error.value = 'Введите название обеда'
    return
  }

  try {
    const lunch = await createLunch.mutateAsync(form.value)

    // Upload images
    if (pendingImages.value.length > 0) {
      isUploading.value = true
      for (const img of pendingImages.value) {
        await uploadImage.mutateAsync({ lunchId: lunch.id, file: img.file })
        URL.revokeObjectURL(img.preview)
      }
      isUploading.value = false
    }

    modalStore.close()
  } catch (e: unknown) {
    isUploading.value = false
    error.value = (e as { message?: string })?.message || 'Ошибка создания'
  }
}
</script>

<template>
  <div class="w-full max-w-2xl">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold">Новый обед</h2>
      <button
        class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary"
        @click="modalStore.close()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <form @submit.prevent="handleSubmit">
      <div v-if="error" class="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
        {{ error }}
      </div>

      <div class="space-y-4">
        <div>
          <label class="mb-2 block text-sm font-medium">Название *</label>
          <input
            v-model="form.title"
            type="text"
            required
            class="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
            placeholder="Например: Борщ с пампушками"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium">Рецепт</label>
          <textarea
            v-model="form.recipe"
            rows="4"
            class="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
            placeholder="Опишите рецепт (поддерживается Markdown)"
          />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium">Калории (ккал)</label>
            <input
              v-model.number="form.calories"
              type="number"
              min="0"
              class="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="250"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">Время (мин)</label>
            <input
              v-model.number="form.cookingTime"
              type="number"
              min="0"
              class="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="30"
            />
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <label class="mb-2 block text-sm font-medium">Белки (г)</label>
            <input
              v-model.number="form.proteins"
              type="number"
              min="0"
              step="0.1"
              class="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="10"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">Жиры (г)</label>
            <input
              v-model.number="form.fats"
              type="number"
              min="0"
              step="0.1"
              class="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="8"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">Углеводы (г)</label>
            <input
              v-model.number="form.carbs"
              type="number"
              min="0"
              step="0.1"
              class="w-full rounded-lg border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="30"
            />
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium">Сложность</label>
          <div class="flex gap-2">
            <button
              v-for="d in (['EASY', 'MEDIUM', 'HARD'] as const)"
              :key="d"
              type="button"
              :class="[
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                form.difficulty === d
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-background hover:bg-secondary',
              ]"
              @click="form.difficulty = form.difficulty === d ? undefined : d"
            >
              {{ d === 'EASY' ? 'Легко' : d === 'MEDIUM' ? 'Средне' : 'Сложно' }}
            </button>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium">Теги</label>
          <div class="flex gap-2">
            <input
              v-model="tagInput"
              type="text"
              class="flex-1 rounded-lg border border-input bg-background px-4 py-3 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="Добавить тег"
              @keydown.enter.prevent="addTag"
            />
            <button
              type="button"
              class="rounded-lg bg-secondary px-4 py-2 font-medium transition-colors hover:bg-secondary/80"
              @click="addTag"
            >
              +
            </button>
          </div>
          <div v-if="form.tags?.length" class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="tag in form.tags"
              :key="tag"
              class="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
            >
              {{ tag }}
              <button type="button" class="hover:text-destructive" @click="removeTag(tag)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </span>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium">Фотографии</label>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="handleFileSelect"
          />

          <div v-if="pendingImages.length" class="mb-3 grid grid-cols-4 gap-2">
            <div
              v-for="(img, idx) in pendingImages"
              :key="idx"
              class="group relative overflow-hidden rounded-lg"
            >
              <img :src="img.preview" class="h-20 w-full object-cover" />
              <button
                type="button"
                class="absolute right-1 top-1 rounded bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                @click="removeImage(idx)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            @click="triggerFileInput"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
            </svg>
            Добавить фото
          </button>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          class="rounded-lg border border-border px-6 py-3 font-medium transition-colors hover:bg-secondary"
          @click="modalStore.close()"
        >
          Отмена
        </button>
        <button
          type="submit"
          :disabled="createLunch.isPending.value || isUploading"
          class="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {{ isUploading ? 'Загрузка фото...' : createLunch.isPending.value ? 'Создание...' : 'Создать' }}
        </button>
      </div>
    </form>
  </div>
</template>
