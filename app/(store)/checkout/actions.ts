'use server'

import { cookies } from 'next/headers'
import { checkoutSchema } from '@/lib/schemas'
import { apiClient } from '@/lib/api/client'
import { generateOrderToken } from '@/lib/order-token'
import type { OrderDto } from '@/lib/api/orders'
import type { InitiatePaymentResponse } from '@/lib/api/payment'

type PlaceOrderResult =
  | { ok: true; redirectUrl: string }
  | { ok: false; error: string }

export async function placeOrder(formData: FormData): Promise<PlaceOrderResult> {
  // ── Parse & validate form ────────────────────────────────────
  let cartRaw: unknown
  try {
    cartRaw = JSON.parse((formData.get('cart') as string) ?? '[]')
  } catch {
    return { ok: false, error: 'Panier invalide' }
  }

  const result = checkoutSchema.safeParse({
    email: (formData.get('email') as string)?.trim().toLowerCase(),
    full_name: (formData.get('full_name') as string)?.trim() || null,
    phone: (formData.get('phone') as string)?.trim(),
    address: (formData.get('address') as string)?.trim(),
    city: (formData.get('city') as string)?.trim(),
    notes: (formData.get('notes') as string)?.trim() || null,
    payment_method: (formData.get('payment_method') as string) || 'genius_pay',
    cart: cartRaw,
  })

  if (!result.success) {
    return { ok: false, error: result.error.issues.map((i) => i.message).join(', ') }
  }

  const { email, full_name, phone, address, city, notes, payment_method, cart: cartItems } = result.data

  // ── Token JWT depuis les cookies ─────────────────────────────
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

  // ── Créer la commande ────────────────────────────────────────
  let order: OrderDto | null = null
  try {
    const orderRes = await apiClient.post<OrderDto>(
      '/commande',
      {
        items: cartItems.map((item) => ({
          productId: item.id,
          variantId: item.variantId ?? null,
          quantity: item.quantity,
        })),
        shippingAddress: {
          full_name: full_name ?? '',
          address: address ?? '',
          city,
          country: 'CI',
          phone,
          email,
        },
        guestEmail: email ?? null,
        notes: notes ?? null,
        paymentMethod: payment_method,
      },
      { headers: authHeaders },
    )
    order = orderRes.data
  } catch (err: unknown) {
    console.error('[placeOrder] Order creation error:', err)
    return { ok: false, error: 'Erreur lors de la création de la commande. Réessayez.' }
  }

  if (!order) return { ok: false, error: 'Commande non créée' }

<<<<<<< HEAD
  const confirmationUrl = `/commande/${order.id}?token=${generateOrderToken(order.id)}`
=======
  // Générer le token AVANT l'initiation du paiement pour l'inclure dans les callbacks GeniusPay.
  // Cela permet à un invité d'accéder à la page de confirmation après redirection depuis GeniusPay.
  const orderToken = generateOrderToken(order.id)
  const confirmationUrl = `/commande/${order.id}?token=${orderToken}`
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e

  // ── Paiement à la livraison ──────────────────────────────────
  if (payment_method === 'cash_on_delivery') {
    return { ok: true, redirectUrl: confirmationUrl }
  }

  // ── GeniusPay ────────────────────────────────────────────────
  try {
    const paymentRes = await apiClient.post<InitiatePaymentResponse>(
      '/payment/initiate',
<<<<<<< HEAD
      { orderId: order.id },
=======
      { orderId: order.id, orderToken },
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
      { headers: authHeaders },
    )
    const paymentUrl = paymentRes.data.paymentUrl
    if (paymentUrl) {
      return { ok: true, redirectUrl: paymentUrl }
    }
<<<<<<< HEAD
  } catch (err: unknown) {
    console.error('[placeOrder] Payment initiation error:', err)
  }

  // Fallback GeniusPay : paiement non initié, aller à la confirmation
  return { ok: true, redirectUrl: confirmationUrl }
=======
    // paymentUrl vide = erreur côté GeniusPay (config manquante ?)
    return { ok: true, redirectUrl: `${confirmationUrl}&payment=init_failed` }
  } catch (err: unknown) {
    console.error('[placeOrder] Payment initiation error:', err)
    return { ok: true, redirectUrl: `${confirmationUrl}&payment=init_failed` }
  }
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
}
