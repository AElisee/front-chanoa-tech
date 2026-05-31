import { apiClient } from './client'

export interface UserDto {
  id: string
  email: string
  name: string
  phone: string | null
  role: 'admin' | 'client' | 'livreur'
  createdAt: string
  updatedAt: string
}

export interface UserListResponse {
  data: UserDto[]
  total: number
  page: number
  limit: number
}

export const usersApi = {
  getUsers: (params?: { page?: number; limit?: number }) =>
    apiClient.get<UserListResponse>('/user', { params }),

  getUser: (id: string) =>
    apiClient.get<UserDto>(`/user/${id}`),

  updateUser: (id: string, data: Partial<Pick<UserDto, 'name' | 'phone'>>) =>
    apiClient.patch<UserDto>(`/user/${id}`, data),
}
