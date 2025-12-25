<script setup lang="ts">
import type { Lunch } from '@shared/types'

defineProps<{
  lunch: Lunch
}>()

defineEmits<{
  click: []
}>()

const difficultyLabels = {
  EASY: 'Легко',
  MEDIUM: 'Средне',
  HARD: 'Сложно',
}

const difficultyColors = {
  EASY: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  HARD: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}
</script>

<template>
  <article
    class="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
    @click="$emit('click')"
  >
    <div class="aspect-video w-full bg-secondary">
      <div
        v-if="!lunch.images.length"
        class="flex h-full items-center justify-center text-4xl text-muted-foreground/30"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <img
        v-else
        :src="lunch.images[0].url"
        :alt="lunch.title"
        class="h-full w-full object-cover"
      />
    </div>

    <div class="p-4">
      <div class="mb-2 flex items-start justify-between gap-2">
        <h3 class="text-lg font-semibold line-clamp-1 group-hover:text-primary">
          {{ lunch.title }}
        </h3>
        <span
          v-if="lunch.difficulty"
          :class="['shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', difficultyColors[lunch.difficulty]]"
        >
          {{ difficultyLabels[lunch.difficulty] }}
        </span>
      </div>

      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="tag in lunch.tags.slice(0, 3)"
          :key="tag"
          class="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
        >
          {{ tag }}
        </span>
        <span
          v-if="lunch.tags.length > 3"
          class="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
        >
          +{{ lunch.tags.length - 3 }}
        </span>
      </div>

      <div class="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
        <div v-if="lunch.calories" class="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
          {{ lunch.calories }} ккал
        </div>
        <div v-if="lunch.cookingTime" class="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ lunch.cookingTime }} мин
        </div>
      </div>
    </div>
  </article>
</template>
