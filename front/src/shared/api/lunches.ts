import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRef, toValue } from 'vue'
import { apiClient } from './client'
import type { Lunch, PaginatedResponse, CreateLunchDto, UpdateLunchDto, LunchQuery } from '@shared/types'

export const lunchKeys = {
  all: ['lunches'] as const,
  lists: () => [...lunchKeys.all, 'list'] as const,
  list: (query: LunchQuery) => [...lunchKeys.lists(), query] as const,
  details: () => [...lunchKeys.all, 'detail'] as const,
  detail: (id: number) => [...lunchKeys.details(), id] as const,
}

export function useLunches(query: MaybeRef<LunchQuery> = {}) {
  return useQuery({
    queryKey: computed(() => lunchKeys.list(toValue(query))),
    queryFn: async () => {
      const params = toValue(query)
      const { data } = await apiClient.get<PaginatedResponse<Lunch>>('/lunches', { params })
      return data
    },
  })
}

export function useLunch(id: MaybeRef<number>) {
  return useQuery({
    queryKey: computed(() => lunchKeys.detail(toValue(id))),
    queryFn: async () => {
      const { data } = await apiClient.get<Lunch>(`/lunches/${toValue(id)}`)
      return data
    },
    enabled: computed(() => !!toValue(id)),
  })
}

export function useCreateLunch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateLunchDto) => {
      const { data } = await apiClient.post<Lunch>('/lunches', dto)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lunchKeys.lists() })
    },
  })
}

export function useUpdateLunch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, dto }: { id: number; dto: UpdateLunchDto }) => {
      const { data } = await apiClient.patch<Lunch>(`/lunches/${id}`, dto)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: lunchKeys.lists() })
      queryClient.setQueryData(lunchKeys.detail(data.id), data)
    },
  })
}

export function useDeleteLunch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/lunches/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lunchKeys.lists() })
    },
  })
}

export function useUploadLunchImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ lunchId, file }: { lunchId: number; file: File }) => {
      const formData = new FormData()
      formData.append('file', file)

      const { data } = await apiClient.post<{ id: number; url: string }>(
        `/lunches/${lunchId}/images/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return data
    },
    onSuccess: (_data, { lunchId }) => {
      queryClient.invalidateQueries({ queryKey: lunchKeys.detail(lunchId) })
      queryClient.invalidateQueries({ queryKey: lunchKeys.lists() })
    },
  })
}

export function useDeleteLunchImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ lunchId, imageId }: { lunchId: number; imageId: number }) => {
      await apiClient.delete(`/lunches/${lunchId}/images/${imageId}`)
      return { lunchId, imageId }
    },
    onSuccess: (_data, { lunchId }) => {
      queryClient.invalidateQueries({ queryKey: lunchKeys.detail(lunchId) })
      queryClient.invalidateQueries({ queryKey: lunchKeys.lists() })
    },
  })
}
