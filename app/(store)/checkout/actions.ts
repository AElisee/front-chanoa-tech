'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { checkoutSchema } from '@/lib/schemas'

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

  // ── Service role client — bypasses RLS ───────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ) as any

  // ── SECURITY: Re-validate prices from DB ─────────────────────
  // Never trust client-sent prices — reload from products/variants
  const productIds = [...new Set(cartItems.map((i) => i.id))]
  const variantIds = [...new Set(cartItems.filter((i) => i.variantId).map((i) => i.variantId!))]

  const [{ data: dbProducts }, { data: dbVariants }] = await Promise.all([
    supabase.from('products').select('id, price, stock, is_active').in('id', productIds),
    variantIds.length > 0
      ? supabase.from('product_variants').select('id, product_id, price, stock, is_active').in('id', variantIds)
      : Promise.resolve({ data: [] as { id: string; product_id: string; price: number; stock: number; is_active: boolean }[] }),
  ])

  type DbProduct = { id: string; price: number; stock: number; is_active: boolean }
  type DbVariant = { id: string; product_id: string; price: number; stock: number; is_active: boolean }

  const productMap = new Map<string, DbProduct>((dbProducts ?? []).map((p: DbProduct) => [p.id, p]))
  const variantMap = new Map<string, DbVariant>((dbVariants ?? []).map((v: DbVariant) => [v.id, v]))

  // Validate each cart item against real DB data
  for (const item of cartItems) {
    const product = productMap.get(item.id)
    if (!product || !product.is_active) {
      redirect('/checkout?error=product_unavailable')
    }

    if (item.variantId) {
      const variant = variantMap.get(item.variantId)
      if (!variant || !variant.is_active) {
        redirect('/checkout?error=variant_unavailable')
      }
      // Use DB price, not client price
      item.price = Number(variant.price)
      if (variant.stock < item.quantity) {
        redirect('/checkout?error=insufficient_stock')
      }
    } else {
      // Use DB price, not client price
      item.price = Number(product.price)
      if (product.stock < item.quantity) {
        redirect('/checkout?error=insufficient_stock')
      }
    }
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  // ── Detect logged-in user ──────────────────────────────────────
  let userId: string | null = null
  try {
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (user) userId = user.id
  } catch { /* guest checkout — no user */ }

  // ── Create order ─────────────────────────────────────────────
  const DELIVERY_FEE = 1500
  const orderPayload: Record<string, unknown> = {
    user_id: userId,
    total: total + DELIVERY_FEE,
    shipping_address: { full_name, address: address ?? '', city, phone, email },
    notes,
    status: 'pending',
    payment_method,
  }

  let order: { id: string } | null = null
  let orderError: { message: string } | null = null

  const res1 = await supabase
    .from('orders')
    .insert({ ...orderPayload, guest_email: email })
    .select('id')
    .single()

  if (res1.error?.message?.includes("'guest_email'")) {
    const res2 = await supabase
      .from('orders')
      .insert(orderPayload)
      .select('id')
      .single()
    order = res2.data
    orderError = res2.error
  } else {
    order = res1.data
    orderError = res1.error
  }

  if (orderError || !order) {
    console.error('Order creation error:', orderError)
    redirect('/checkout?error=order_failed')
  }

  // ── Create order items ───────────────────────────────────────
  // product_snapshot now includes variant info for invoice generation
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    variant_id: item.variantId ?? null,
    quantity: item.quantity,
    unit_price: item.price,
    product_snapshot: {
      name: item.name,
      price: item.price,
      slug: item.slug,
      ...(item.variantId && { variant_id: item.variantId }),
      ...(item.variantLabel && { variant_label: item.variantLabel }),
    },
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    console.error('Order items error:', itemsError)
    // Order was created — continue to payment anyway
  }

  // ── Cash on delivery — skip online payment ──────────────────
  if (payment_method === 'cash_on_delivery') {
    redirect(`/commande/${order.id}`)
  }

  // ── Initiate GeniusPay payment ──────────────────────────────
  // IMPORTANT: redirect() must NOT be inside a try/catch (it throws NEXT_REDIRECT)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const paymentInitUrl = `${supabaseUrl}/functions/v1/payment-initiate`

  let checkoutUrl: string | null = null
  try {
    const payRes = await fetch(paymentInitUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        order_id: order.id,
        amount: total,
        customer_email: email,
        customer_phone: phone,
        customer_name: full_name ?? '',
      }),
    })

    const payData = await payRes.json()

    if (payRes.ok && payData.checkout_url) {
      checkoutUrl = payData.checkout_url as string
    } else {
      console.error('Payment initiation failed:', payData)
    }
  } catch (err) {
    console.error('Payment initiation error:', err)
  }

  // Redirect OUTSIDE try/catch so Next.js redirect() works properly
  if (checkoutUrl) {
    redirect(checkoutUrl)
  }

  // Fallback: redirect to order confirmation (payment can be retried)
  redirect(`/commande/${order.id}`)
}
