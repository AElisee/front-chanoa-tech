import { z } from 'zod'

// ── Checkout / placeOrder ──────────────────────────────────────

export const cartItemSchema = z.object({
  id: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  variantLabel: z.string().optional(),
  name: z.string().min(1),
  price: z.coerce.number().nonnegative(),     // MySQL DECIMAL → string en runtime
  quantity: z.coerce.number().int().positive(),
  slug: z.string().min(1),
})

export const paymentMethodSchema = z.enum(['genius_pay', 'cash_on_delivery'])

export const checkoutSchema = z.object({
  email: z.string().email('Email invalide'),
  full_name: z.string().max(200).nullable(),
  phone: z.string().min(8, 'Téléphone requis (min 8 chiffres)').max(20),
  address: z.string().max(500).nullable().optional(),
  city: z.string().min(2, 'Commune requise'),
  notes: z.string().max(1000).nullable(),
  payment_method: paymentMethodSchema.default('genius_pay'),
  cart: z.array(cartItemSchema).min(1, 'Le panier est vide'),
})

// ── Admin: Categories ──────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100),
  slug: z.string().max(120).optional(),
  parent_id: z.string().uuid().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
})

export const updateCategorySchema = createCategorySchema.extend({
  description: z.string().max(500).nullable().optional(),
  sort_order: z.number().int().nonnegative().default(0),
})

// ── Admin: Products ────────────────────────────────────────────

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(300),
  description: z.string().max(5000).nullable(),
  brand: z.string().max(100).nullable(),
  model: z.string().max(100).nullable(),
  sku: z.string().max(100).nullable(),
  price: z.number().nonnegative('Le prix doit être positif'),
  price_eur: z.number().nonnegative().nullable(),
  compare_price: z.number().nonnegative().nullable(),
  stock: z.number().int().nonnegative('Le stock doit être positif'),
  categoryId: z.string().uuid().nullable(),
  is_active: z.boolean(),
  images: z.array(z.string().url()).max(5),
})

// ── Admin: Orders ──────────────────────────────────────────────

const validOrderStatuses = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled',
] as const

export const updateOrderStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(validOrderStatuses),
})

export const updateTrackingSchema = z.object({
  order_id: z.string().uuid(),
  carrier: z.string().max(100).nullable(),
  tracking_number: z.string().max(200).nullable(),
})

export const updateOrderNotesSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().max(2000).nullable(),
})
