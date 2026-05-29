import { apiClient } from './client'

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface VariantDto {
  id: string
  product_id: string
  options: Record<string, string>
  price: number
  stock: number
  sku: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CreateVariantDto {
  options: Record<string, string>
  price: number
  stock: number
  sku?: string | null
  is_active?: boolean
  sort_order?: number
}

export interface ProductDto {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  price_eur: number | null
  compare_price: number | null
  stock: number
  category_id: string | null
  images: string[]
  brand: string | null
  model: string | null
  sku: string | null
  status: 'draft' | 'active' | 'archived'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductListResponse {
  data: ProductDto[]
  total: number
  page: number
  limit: number
}

export interface GetProductsParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
}

export interface CreateProductDto {
  name: string
  slug: string
  description?: string | null
  price: number
  price_eur?: number | null
  compare_price?: number | null
  stock?: number
  category_id?: string | null
  images?: string[]
  brand?: string | null
  model?: string | null
  sku?: string | null
  status?: 'draft' | 'active' | 'archived'
  is_active?: boolean
}

export interface UpdateProductDto {
  name?: string
  slug?: string
  description?: string | null
  price?: number
  price_eur?: number | null
  compare_price?: number | null
  stock?: number
  category_id?: string | null
  images?: string[]
  brand?: string | null
  model?: string | null
  sku?: string | null
  status?: 'draft' | 'active' | 'archived'
  is_active?: boolean
}

// ── API ───────────────────────────────────────────────────────────────────────

export const productsApi = {
  getProducts: (params?: GetProductsParams) =>
    apiClient.get<ProductListResponse>('/produits', { params }),

  getProduct: (id: string) =>
    apiClient.get<ProductDto>(`/produits/${id}`),

  createProduct: (data: CreateProductDto) =>
    apiClient.post<ProductDto>('/produits', data),

  updateProduct: (id: string, data: UpdateProductDto) =>
    apiClient.patch<ProductDto>(`/produits/${id}`, data),

  deleteProduct: (id: string) =>
    apiClient.delete<void>(`/produits/${id}`),

  // ── Variantes ──────────────────────────────────────────────────────────────

  getProductVariants: (productId: string) =>
    apiClient.get<VariantDto[]>(`/produits/${productId}/variants`),

  createVariant: (productId: string, data: CreateVariantDto) =>
    apiClient.post<VariantDto>(`/produits/${productId}/variants`, data),

  updateVariant: (productId: string, variantId: string, data: Partial<CreateVariantDto>) =>
    apiClient.patch<VariantDto>(`/produits/${productId}/variants/${variantId}`, data),

  deleteVariant: (productId: string, variantId: string) =>
    apiClient.delete<void>(`/produits/${productId}/variants/${variantId}`),
}
