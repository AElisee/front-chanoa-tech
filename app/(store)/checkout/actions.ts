'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { checkoutSchema } from '@/lib/schemas'
import { apiClient } from '@/lib/api/client'
import { generateOrderToken } from '@/lib/order-token'
import type { OrderDto } from '@/lib/api/orders'
import type { InitiatePaymentResponse } from '@/lib/api/payment'

export async function placeOrder(formData: FormData) {
  // ── Parse & validate form with Zod ───────────────────────────
  let cartRaw: unknown
  try {
    cartRaw = JSON.parse((formData.get('cart') as string) ?? '[]')
  } catch {
    redirect('/checkout?error=invalid_cart')
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
    const msg = result.error.issues.map((i) => i.message).join(', ')
    redirect(`/checkout?error=${encodeURIComponent(msg)}`)
  }

  const { email, full_name, phone, address, city, notes, payment_method, cart: cartItems } = result.data

  // ── Récupérer le token JWT depuis les cookies ────────────────
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

  // ── Créer la commande via l'API NestJS ───────────────────────
  // La validation des prix et du stock est faite côté API (source de vérité)
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
      { headers: authHeaders }
    )
    order = orderRes.data
  } catch (err: unknown) {
    console.error('Order creation error:', err)
    redirect('/checkout?error=order_failed')
  }

  if (!order) {
    redirect('/checkout?error=order_failed')
  }

  // ── Paiement à la livraison — pas de redirection de paiement ─
  if (payment_method === 'cash_on_delivery') {
    redirect(`/commande/${order.id}?token=${generateOrderToken(order.id)}`)
  }

  // ── Initier le paiement GeniusPay ────────────────────────────
  // IMPORTANT : redirect() ne doit PAS être dans un try/catch (il lève NEXT_REDIRECT)
  let paymentUrl: string | null = null
  try {
    const paymentRes = await apiClient.post<InitiatePaymentResponse>(
      '/payment/initiate',
      { orderId: order.id },
      { headers: authHeaders }
    )
    paymentUrl = paymentRes.data.paymentUrl ?? null
  } catch (err: unknown) {
    console.error('Payment initiation error:', err)
  }

  // Redirection vers GeniusPay (ou fallback vers la page de confirmation)
  if (paymentUrl) {
    redirect(paymentUrl)
  }

  // Fallback : la commande est créée, le paiement peut être relancé
  redirect(`/commande/${order.id}?token=${generateOrderToken(order.id)}`)
}
