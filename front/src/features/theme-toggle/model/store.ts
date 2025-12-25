import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { usePreferredDark, useStorage } from '@vueuse/core'

export type Theme = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  const prefersDark = usePreferredDark()
  const storedTheme = useStorage<Theme>('theme', 'system')
  const theme = ref<Theme>(storedTheme.value)

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    storedTheme.value = newTheme
  }

  function toggleTheme() {
    if (theme.value === 'light') {
      setTheme('dark')
    } else if (theme.value === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  function applyTheme() {
    const isDark = theme.value === 'dark' || (theme.value === 'system' && prefersDark.value)

    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  watch([theme, prefersDark], applyTheme, { immediate: true })

  return {
    theme,
    setTheme,
    toggleTheme,
  }
})
