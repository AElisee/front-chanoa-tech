/**
 * Typed results for Supabase queries that include joined relations.
 * These supplement the base Database types which don't encode relations.
 */

export interface ProductWithCategory {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_price: number | null
  stock: number
  category_id: string | null
  images: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  categories: { name: string; slug: string } | null
}

export interface OrderWithProfile {
  id: string
  status: string
  total: number
  created_at: string
  updated_at: string
  shipping_address: unknown
  notes: string | null
  user_id: string | null
  profiles: { full_name: string | null; email: string } | null
}

export interface OrderWithItems {
  id: string
  status: string
  total: number
  created_at: string
  shipping_address: unknown
  order_items: {
    id: string
    quantity: number
    unit_price: number
    product_snapshot: { name?: string; price?: number; slug?: string }
  }[]
  deliveries: {
    tracking_number: string | null
    carrier: string | null
    status: string | null
  } | null
}
