import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import type { User } from '@shared/types'
import { apiClient } from '@shared/api'

export const useSessionStore = defineStore('session', () => {
  const queryClient = useQueryClient()
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  async function fetchCurrentUser() {
    isLoading.value = true
    try {
      const { data } = await apiClient.get<User>('/auth/me')
      user.value = data
    } catch {
      user.value = null
      localStorage.removeItem('accessToken')
    } finally {
      isLoading.value = false
    }
  }

  async function login(email: string, password: string) {
    const { data } = await apiClient.post<{ user: User; accessToken: string }>('/auth/login', {
      email,
      password,
    })
    localStorage.setItem('accessToken', data.accessToken)
    user.value = data.user
    queryClient.clear()
  }

  async function loginWithGoogle(idToken: string) {
    const { data } = await apiClient.post<{ user: User; accessToken: string }>('/auth/google', {
      idToken,
    })
    localStorage.setItem('accessToken', data.accessToken)
    user.value = data.user
    queryClient.clear()
  }

  async function register(email: string, password: string, name: string) {
    const { data } = await apiClient.post<{ user: User; accessToken: string }>('/auth/register', {
      email,
      password,
      name,
    })
    localStorage.setItem('accessToken', data.accessToken)
    user.value = data.user
    queryClient.clear()
  }

  async function logout() {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      user.value = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('cart')
      queryClient.clear()
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    fetchCurrentUser,
    login,
    loginWithGoogle,
    register,
    logout,
  }
})
