import { apiClient } from './client'

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface CartItemDto {
  id: string
  cart_id: string
  product_id: string
  quantity: number
  unit_price: number
  created_at: string
}

export interface CartDto {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  items?: CartItemDto[]
}

export interface AddCartItemDto {
  productId: string
  quantity: number
  unitPrice: number
}

export interface UpdateCartItemDto {
  quantity: number
}

// ── API ───────────────────────────────────────────────────────────────────────

export const cartApi = {
  createCart: () =>
    apiClient.post<CartDto>('/cart'),

  getMyCart: () =>
    apiClient.get<CartDto>('/cart/me'),

  addItem: (cartId: string, data: AddCartItemDto) =>
    apiClient.post<CartItemDto>(`/cart/${cartId}/items`, data),

  updateItem: (id: string, data: UpdateCartItemDto) =>
    apiClient.patch<CartItemDto>(`/cart/items/${id}`, data),

  removeItem: (id: string) =>
    apiClient.delete<void>(`/cart/items/${id}`),
}
