/**
 * EF-01 — send-order-email
 *
 * Triggered by: Database Webhook → INSERT on public.orders
 * Sends an order confirmation email to the customer via Resend.
 *
 * Setup in Supabase:
 *   Dashboard → Database → Webhooks → Create
 *   Table: orders  |  Events: INSERT
 *   URL: https://<project>.supabase.co/functions/v1/send-order-email
 *   Headers: { Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY> }
 */

import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { sendEmail } from '../_shared/resend.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { orderConfirmationEmail } from '../_shared/email-templates.ts'

Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // Webhook payload from Supabase DB webhook
    const payload = await req.json()
    const order = payload.record ?? payload // support both webhook and direct call

    if (!order?.id) {
      return new Response(JSON.stringify({ error: 'No order record' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createServiceClient()

    // Fetch order with items
    const { data: fullOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id, total, shipping_address, notes,
        order_items(quantity, unit_price, product_snapshot),
        profiles(full_name, email)
      `)
      .eq('id', order.id)
      .single()

    if (fetchError || !fullOrder) {
      console.error('Fetch error:', fetchError)
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    type ProfileRow = { full_name: string | null; email: string } | null
    type ItemRow = { quantity: number; unit_price: number; product_snapshot: { name: string } }

    const profile = fullOrder.profiles as unknown as ProfileRow
    const addr    = fullOrder.shipping_address as {
      full_name?: string; email?: string; phone?: string; address?: string; city?: string
    }
    const items   = (fullOrder.order_items ?? []) as ItemRow[]

    const clientEmail = profile?.email ?? addr?.email
    if (!clientEmail) {
      console.warn('No email found for order', order.id)
      return new Response(JSON.stringify({ skipped: true, reason: 'no_email' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { subject, html } = orderConfirmationEmail({
      orderId:    fullOrder.id,
      shortId:    fullOrder.id.slice(0, 8).toUpperCase(),
      clientName: profile?.full_name ?? addr?.full_name ?? '',
      items:      items.map((i) => ({
        name:       i.product_snapshot?.name ?? 'Produit',
        quantity:   i.quantity,
        unit_price: i.unit_price,
      })),
      total:   Number(fullOrder.total),
      address: addr?.address ?? '',
      city:    addr?.city ?? '',
      phone:   addr?.phone ?? profile?.phone ?? undefined,
    })

    const result = await sendEmail({ to: clientEmail, subject, html })

    if (result.error) {
      console.error('Resend error:', result.error)
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Order confirmation sent to ${clientEmail} (order ${order.id})`)
    return new Response(JSON.stringify({ ok: true, emailId: result.id }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
