<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ModalContainer } from '@widgets/modal-container'
import { BottomNav } from '@widgets/bottom-nav'
import { useThemeStore } from '@features/theme-toggle'

// Initialize theme
useThemeStore()
</script>

<template>
  <div class="min-h-screen bg-background pb-16 text-foreground md:pb-0">
    <RouterView />
    <ModalContainer />
    <BottomNav />
  </div>
</template>
