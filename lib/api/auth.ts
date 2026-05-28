import { apiClient } from './client'

export interface LoginResponse {
  accessToken: string
  refreshToken?: string
  user: {
    id: string
    email: string
    name: string
    role: 'user' | 'admin'
  }
}

export interface RegisterDto {
  name: string
  email: string
  password: string
  phone?: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  phone: string | null
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>('/auth/login', { email, password }),

  register: (data: RegisterDto) =>
    apiClient.post<LoginResponse>('/auth/register', data),

  logout: () =>
    apiClient.post<void>('/auth/logout'),

  refresh: () =>
    apiClient.post<{ accessToken: string }>('/auth/refresh'),

  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post<{ message: string }>('/auth/reset-password', { token, password }),

  getProfile: () =>
    apiClient.get<UserProfile>('/auth/profile'),
}
