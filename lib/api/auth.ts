import { apiClient } from './client'

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: {
    id: string
    email: string
    name: string
    role: 'admin' | 'client' | 'livreur'
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
  role: 'admin' | 'client' | 'livreur'
  createdAt: string
  updatedAt: string
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>('/auth/login', { email, password }),

  register: (data: RegisterDto) =>
    apiClient.post<LoginResponse>('/auth/register', data),

  logout: () =>
    fetch('/api/auth/logout', { method: 'POST' }),

  refresh: () =>
    apiClient.post<{ accessToken: string }>('/auth/refresh'),

  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, pass: string, passConfirm: string) =>
    apiClient.post<{ message: string }>('/auth/reset-password', { token, pass, passConfirm }),

  getProfile: () =>
    apiClient.get<UserProfile>('/auth/profile'),
}
