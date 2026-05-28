/**
 * EF-03b — payment-webhook (GeniusPay)
 *
 * Receives webhook events from GeniusPay when payment status changes.
 * Verifies HMAC-SHA256 signature with format: HMAC(timestamp + "." + body, secret)
 *
 * Configure in GeniusPay Dashboard → Webhooks:
 *   URL:    https://<project>.supabase.co/functions/v1/payment-webhook
 *   Events: payment.success, payment.failed, payment.cancelled, payment.expired, payment.refunded
 *
 * Env vars required:
 *   GENIUSPAY_WEBHOOK_SECRET   (whsec_xxx)
 *
 * Always returns 200 to prevent GeniusPay from retrying (except for auth errors).
 */

import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

async function computeHmacSha256(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const rawBody = await req.text()

    const signature   = req.headers.get('X-Webhook-Signature') ?? ''
    const timestamp   = req.headers.get('X-Webhook-Timestamp') ?? ''
    const event       = req.headers.get('X-Webhook-Event') ?? ''
    const environment = req.headers.get('X-Webhook-Environment') ?? 'unknown'

    const webhookSecret = Deno.env.get('GENIUSPAY_WEBHOOK_SECRET')

    // ── SECURITY: webhook secret is MANDATORY ─────────────────────
    if (!webhookSecret) {
      console.error('CRITICAL: GENIUSPAY_WEBHOOK_SECRET not configured — rejecting webhook')
      return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Signature verification ────────────────────────────────────
    if (!signature || !timestamp) {
      console.error('Missing webhook signature or timestamp headers')
      return new Response(JSON.stringify({ error: 'Missing signature' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // GeniusPay format: HMAC-SHA256(timestamp + "." + body, secret)
    const signaturePayload = `${timestamp}.${rawBody}`
    const expected = await computeHmacSha256(signaturePayload, webhookSecret)

    if (!timingSafeEqual(expected, signature)) {
      console.error('Invalid webhook signature')
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Replay protection: 5-minute window
    const ts = parseInt(timestamp, 10)
    if (!ts || Math.abs(Math.floor(Date.now() / 1000) - ts) > 300) {
      console.error('Webhook timestamp expired or invalid:', timestamp)
      return new Response(JSON.stringify({ error: 'Timestamp out of range' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Parse payload ─────────────────────────────────────────────
    let payload
    try {
      payload = JSON.parse(rawBody)
    } catch {
      console.error('Invalid JSON body')
      return new Response('ok', { status: 200, headers: corsHeaders })
    }

    const tx          = payload.data ?? payload
    const reference   = tx.reference as string | undefined
    const status      = tx.status as string | undefined
    const metadata    = tx.metadata as Record<string, unknown> | undefined
    const orderIdMeta = metadata?.order_id as string | undefined

    console.log(`Webhook: event=${event} env=${environment} ref=${reference} status=${status} order=${orderIdMeta}`)

    if (!reference && !orderIdMeta) {
      console.error('No reference and no metadata.order_id — cannot route webhook')
      return new Response('ok', { status: 200, headers: corsHeaders })
    }

    const supabase = createServiceClient()

    // ── Find matching order ───────────────────────────────────────
    let orderId = orderIdMeta
    if (!orderId && reference) {
      const { data: orders } = await supabase
        .from('orders')
        .select('id, status')
        .eq('payment_reference', reference)
        .limit(1)
      orderId = orders?.[0]?.id
    }

    if (!orderId) {
      console.error('Could not find order for webhook:', { reference, orderIdMeta, event })
      return new Response('ok', { status: 200, headers: corsHeaders })
    }

    // ── Route by event + status ───────────────────────────────────
    const isSuccess = event === 'payment.success' || status === 'completed'
    const isFailed = (
      event === 'payment.failed' ||
      event === 'payment.cancelled' ||
      event === 'payment.expired' ||
      status === 'failed' ||
      status === 'cancelled'
    )
    const isRefunded = event === 'payment.refunded' || status === 'refunded'

    if (isSuccess) {
      // Idempotent: only update if still pending
      const { error } = await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', orderId)
        .eq('status', 'pending')
      if (error) console.error('Failed to confirm order:', error)
      else console.log(`✓ Payment success: order=${orderId}`)

    } else if (isFailed) {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('status', 'pending')
      if (error) console.error('Failed to cancel order:', error)
      else console.log(`✗ Payment failed (${event}): order=${orderId}`)

    } else if (isRefunded) {
      await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
      console.log(`↩ Payment refunded: order=${orderId}`)

    } else {
      console.log(`No action for event=${event} status=${status}`)
    }

    return new Response('ok', { status: 200, headers: corsHeaders })

  } catch (err) {
    console.error('Webhook error:', err)
    // Always return 200 to prevent GeniusPay retries
    return new Response('ok', { status: 200 })
  }
})
