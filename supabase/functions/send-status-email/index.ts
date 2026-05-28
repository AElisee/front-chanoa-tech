/**
 * EF-02 — send-status-email
 *
 * Triggered by: Database Webhook → UPDATE on public.orders (column: status)
 * Sends a status-change notification to the customer when an order status changes.
 * Statuses that trigger an email: confirmed, shipped, delivered, cancelled
 *
 * Setup in Supabase:
 *   Dashboard → Database → Webhooks → Create
 *   Table: orders  |  Events: UPDATE  |  Column filter: status
 *   URL: https://<project>.supabase.co/functions/v1/send-status-email
 */

import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { sendEmail } from '../_shared/resend.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { statusUpdateEmail } from '../_shared/email-templates.ts'

// Statuses that do NOT warrant an email
const SILENT_STATUSES = new Set(['pending', 'processing'])

Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const payload = await req.json()

    // Supabase DB webhook sends { type: 'UPDATE', record: {...}, old_record: {...} }
    const newRecord = payload.record ?? payload
    const oldRecord = payload.old_record ?? {}

    const newStatus = newRecord.status
    const oldStatus = oldRecord.status

    // Skip if status didn't change or is silent
    if (!newStatus || newStatus === oldStatus || SILENT_STATUSES.has(newStatus)) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no_email_for_status' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createServiceClient()

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id, total, shipping_address,
        profiles(full_name, email),
        deliveries(carrier, tracking_number)
      `)
      .eq('id', newRecord.id)
      .single()

    if (fetchError || !order) {
      console.error('Order not found:', fetchError)
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    type ProfileRow = { full_name: string | null; email: string } | null
    type DeliveryRow = { carrier: string | null; tracking_number: string | null }

    const profile  = order.profiles as unknown as ProfileRow
    const addr     = order.shipping_address as { full_name?: string; email?: string }
    const delivery = Array.isArray(order.deliveries)
      ? (order.deliveries[0] as DeliveryRow | undefined)
      : (order.deliveries as DeliveryRow | undefined)

    const clientEmail = profile?.email ?? addr?.email
    if (!clientEmail) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no_email' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const emailData = statusUpdateEmail({
      orderId:        order.id,
      shortId:        order.id.slice(0, 8).toUpperCase(),
      clientName:     profile?.full_name ?? addr?.full_name ?? '',
      newStatus,
      total:          Number(order.total),
      trackingNumber: delivery?.tracking_number ?? null,
      carrier:        delivery?.carrier ?? null,
    })

    if (!emailData) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no_template' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = await sendEmail({ to: clientEmail, subject: emailData.subject, html: emailData.html })

    if (result.error) {
      console.error('Resend error:', result.error)
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Status email (${newStatus}) sent to ${clientEmail} (order ${order.id})`)
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
