import axios from 'axios'
import type { ApiError } from '@shared/types'

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const { data } = await axios.post('/api/v1/auth/refresh', {}, {
          withCredentials: true,
        })

        localStorage.setItem('accessToken', data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`

        return apiClient(originalRequest)
      } catch {
        localStorage.removeItem('accessToken')
        window.location.href = '/auth/login'
        return Promise.reject(error)
      }
    }

    const apiError: ApiError = {
      message: error.response?.data?.message || 'An error occurred',
      errors: error.response?.data?.errors,
    }

    return Promise.reject(apiError)
  }
)
