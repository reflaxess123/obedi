export interface User {
  id: number
  email: string
  name: string
  avatarUrl: string | null
  provider: 'EMAIL' | 'GOOGLE'
  createdAt: string
  updatedAt: string
}

export interface Lunch {
  id: number
  userId: number
  title: string
  recipe: string | null
  calories: number | null
  proteins: number | null
  fats: number | null
  carbs: number | null
  cookingTime: number | null
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | null
  tags: string[]
  images: LunchImage[]
  user?: User
  createdAt: string
  updatedAt: string
}

export interface LunchImage {
  id: number
  url: string
  key: string
  width: number | null
  height: number | null
  position: number
}

export interface CreateLunchDto {
  title: string
  recipe?: string
  calories?: number
  proteins?: number
  fats?: number
  carbs?: number
  cookingTime?: number
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  tags?: string[]
}

export interface UpdateLunchDto extends Partial<CreateLunchDto> {}

export interface LunchQuery {
  page?: number
  limit?: number
  userId?: number
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    currentPage: number
    totalPages: number
    totalCount: number
    perPage: number
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'COOKING' | 'READY' | 'DELIVERED' | 'CANCELLED'

export interface OrderItem {
  id: number
  lunch: {
    id: number
    title: string
    image: string | null
  }
}

export interface OrderHistory {
  id: number
  status: OrderStatus
  comment: string | null
  createdAt: string
}

export interface Order {
  id: number
  status: OrderStatus
  comment: string | null
  customer: { id: number; name: string; avatarUrl: string | null }
  chef: { id: number; name: string; avatarUrl: string | null }
  items: OrderItem[]
  history: OrderHistory[]
  createdAt: string
  updatedAt: string
}

export interface CreateOrderDto {
  chefId: number
  lunchIds: number[]
  comment?: string
}

export interface UpdateOrderStatusDto {
  status: OrderStatus
  comment?: string
}

export interface OrderQuery {
  role?: 'customer' | 'chef'
  status?: OrderStatus
}
