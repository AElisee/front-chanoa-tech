'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string          // product id
  variantId?: string  // product_variant id (optional — products without variants omit this)
  variantLabel?: string // human label e.g. "16 Go / 512 Go SSD"
  name: string
  price: number
  image: string | null
  slug: string
  quantity: number
}

// Unique key per line item: same product + same variant = same slot
function itemKey(id: string, variantId?: string) {
  return variantId ? `${id}__${variantId}` : id
}

interface CartStore {
  items: CartItem[]
  itemCount: number
  total: number
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string, variantId?: string) => void
  updateQuantity: (id: string, quantity: number, variantId?: string) => void
  clearCart: () => void
}

function computeDerived(items: CartItem[]) {
  return {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  }
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      itemCount: 0,
      total: 0,

      addItem(product) {
        set((state) => {
          const key = itemKey(product.id, product.variantId)
          const existing = state.items.find(
            (i) => itemKey(i.id, i.variantId) === key
          )
          const items = existing
            ? state.items.map((i) =>
                itemKey(i.id, i.variantId) === key
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              )
            : [...state.items, { ...product, quantity: 1 }]
          return { items, ...computeDerived(items) }
        })
      },

      removeItem(id, variantId) {
        set((state) => {
          const key = itemKey(id, variantId)
          const items = state.items.filter(
            (i) => itemKey(i.id, i.variantId) !== key
          )
          return { items, ...computeDerived(items) }
        })
      },

      updateQuantity(id, quantity, variantId) {
        set((state) => {
          const key = itemKey(id, variantId)
          const items = quantity <= 0
            ? state.items.filter((i) => itemKey(i.id, i.variantId) !== key)
            : state.items.map((i) =>
                itemKey(i.id, i.variantId) === key ? { ...i, quantity } : i
              )
          return { items, ...computeDerived(items) }
        })
      },

      clearCart() {
        set({ items: [], itemCount: 0, total: 0 })
      },
    }),
    { name: 'chanoa-cart' }
  )
)
