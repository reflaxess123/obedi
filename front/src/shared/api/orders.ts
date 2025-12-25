import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRef, toValue } from 'vue'
import { apiClient } from './client'
import type { Order, CreateOrderDto, UpdateOrderStatusDto, OrderQuery } from '@shared/types'

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (query: OrderQuery) => [...orderKeys.lists(), query] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
  history: () => [...orderKeys.all, 'history'] as const,
}

export function useOrders(query: MaybeRef<OrderQuery> = {}) {
  return useQuery({
    queryKey: computed(() => orderKeys.list(toValue(query))),
    queryFn: async () => {
      const params = toValue(query)
      const { data } = await apiClient.get<Order[]>('/orders', { params })
      return data
    },
  })
}

export function useOrder(id: MaybeRef<number>) {
  return useQuery({
    queryKey: computed(() => orderKeys.detail(toValue(id))),
    queryFn: async () => {
      const { data } = await apiClient.get<Order>(`/orders/${toValue(id)}`)
      return data
    },
    enabled: computed(() => !!toValue(id)),
  })
}

export function useOrderHistory() {
  return useQuery({
    queryKey: orderKeys.history(),
    queryFn: async () => {
      const { data } = await apiClient.get<Order[]>('/orders/history')
      return data
    },
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateOrderDto) => {
      const { data } = await apiClient.post<Order>('/orders', dto)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, dto }: { id: number; dto: UpdateOrderStatusDto }) => {
      const { data } = await apiClient.patch<Order>(`/orders/${id}/status`, dto)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.setQueryData(orderKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: orderKeys.history() })
    },
  })
}
