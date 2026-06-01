import { apiClient } from './client'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface ShippingAddress {
  full_name: string
 
  email?: string | null
  phone: string
  address?: string | null
  city: string
  country?: string | nulls
  notes?: string | null
}

export interface OrderItemInput {
  productId: string
  variantId?: string
  quantity: number
  unitPrice: number
  productSnapshot?: Record<string, unknown>
}

export interface CreateOrderDto {
  items: OrderItemInput[]
  shippingAddress: ShippingAddress
  guestEmail?: string
  notes?: string | null
  paymentMethod?: 'genius_pay' | 'cash_on_delivery'
}

export interface UpdateOrderDto {
  status?: OrderStatus
  notes?: string | null
  shipping_address?: ShippingAddress
  payment_reference?: string | null
}

export interface OrderItemDto {
  id: string
  product_id: string | null
  variant_id: string | null
  quantity: number
  unit_price: number
  product_snapshot: Record<string, unknown>
  created_at: string
}

export interface OrderDto {
  id: string
  user_id: string | null
  guest_email: string | null
  status: OrderStatus
  total: number
  shipping_address: ShippingAddress
  notes: string | null
  payment_reference: string | null
<<<<<<< HEAD
=======
  payment_method: string | null
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
  created_at: string
  updated_at: string
  order_items?: OrderItemDto[]
}

export interface OrderListResponse {
  data: OrderDto[]
  total: number
  page: number
  limit: number
}

export interface GetOrdersParams {
  page?: number
  limit?: number
}

// ── API ───────────────────────────────────────────────────────────────────────

export const ordersApi = {
  createOrder: (data: CreateOrderDto) =>
    apiClient.post<OrderDto>('/commande', data),

  getOrders: (params?: GetOrdersParams) =>
    apiClient.get<OrderListResponse>('/commande', { params }),

  getOrder: (id: string) =>
    apiClient.get<OrderDto>(`/commande/${id}`),

  updateOrder: (id: string, data: UpdateOrderDto) =>
    apiClient.patch<OrderDto>(`/commande/${id}`, data),
}
