import { apiClient } from './client'

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface CategoryDto {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  product_count?: number
}

export interface CategoryListResponse {
  data: CategoryDto[]
  total: number
  page: number
  limit: number
}

export interface GetCategoriesParams {
  page?: number
  limit?: number
}

export interface CreateCategoryDto {
  name: string
  slug?: string
  description?: string | null
  image_url?: string | null
  parent_id?: string | null
  is_active?: boolean
  sort_order?: number
}

export interface UpdateCategoryDto {
  name?: string
  slug?: string
  description?: string | null
  image_url?: string | null
  parent_id?: string | null
  is_active?: boolean
  sort_order?: number
}

// ── API ───────────────────────────────────────────────────────────────────────

export const categoriesApi = {
  getCategories: (params?: GetCategoriesParams) =>
    apiClient.get<CategoryListResponse>('/categorie', { params }),

  getCategory: (id: string) =>
    apiClient.get<CategoryDto>(`/categorie/${id}`),

  createCategory: (data: CreateCategoryDto) =>
    apiClient.post<CategoryDto>('/categorie', data),

  updateCategory: (id: string, data: UpdateCategoryDto) =>
    apiClient.patch<CategoryDto>(`/categorie/${id}`, data),

  deleteCategory: (id: string) =>
    apiClient.delete<void>(`/categorie/${id}`),
}
