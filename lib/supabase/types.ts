export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type UserRole = 'user' | 'admin'

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          phone?: string | null
          role?: UserRole
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          is_active?: boolean
          sort_order?: number
        }
      }
      products: {
        Row: {
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
          search_vector: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
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
          created_at?: string
          updated_at?: string
        }
        Update: {
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
          updated_at?: string
        }
      }
      carts: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id: string
          quantity?: number
          created_at?: string
        }
        Update: {
          quantity?: number
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          guest_email: string | null
          status: OrderStatus
          total: number
          shipping_address: Json
          notes: string | null
          payment_reference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          guest_email?: string | null
          status?: OrderStatus
          total: number
          shipping_address: Json
          notes?: string | null
          payment_reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: OrderStatus
          guest_email?: string | null
          shipping_address?: Json
          notes?: string | null
          payment_reference?: string | null
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          variant_id: string | null
          quantity: number
          unit_price: number
          product_snapshot: Json
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          variant_id?: string | null
          quantity: number
          unit_price: number
          product_snapshot: Json
          created_at?: string
        }
        Update: never
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          sku: string | null
          options: Record<string, string>   // e.g. { ram: "16 Go", stockage: "512 Go" }
          price: number
          price_eur: number | null
          compare_price: number | null
          stock: number
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          sku?: string | null
          options?: Record<string, string>
          price: number
          price_eur?: number | null
          compare_price?: number | null
          stock?: number
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          sku?: string | null
          options?: Record<string, string>
          price?: number
          price_eur?: number | null
          compare_price?: number | null
          stock?: number
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
      }
      deliveries: {
        Row: {
          id: string
          order_id: string
          tracking_number: string | null
          carrier: string | null
          status: string | null
          notes: string | null
          shipped_at: string | null
          delivered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          tracking_number?: string | null
          carrier?: string | null
          status?: string | null
          notes?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          tracking_number?: string | null
          carrier?: string | null
          status?: string | null
          notes?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      order_status: OrderStatus
      user_role: UserRole
    }
  }
}
