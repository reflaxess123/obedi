import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRef, toValue } from 'vue'
import { apiClient } from './client'
import type { User } from '@shared/types'

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
}

export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: async () => {
      const { data } = await apiClient.get<User[]>('/users')
      return data
    },
  })
}

export function useUser(id: MaybeRef<number>) {
  return useQuery({
    queryKey: computed(() => userKeys.detail(toValue(id))),
    queryFn: async () => {
      const { data } = await apiClient.get<User>(`/users/${toValue(id)}`)
      return data
    },
    enabled: computed(() => !!toValue(id)),
  })
}
