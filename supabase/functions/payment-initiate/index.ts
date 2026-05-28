/**
 * EF-03a — payment-initiate (GeniusPay Merchant API)
 *
 * Creates a GeniusPay checkout session. The customer is redirected to
 * GeniusPay's hosted payment page where they choose Wave, Orange Money,
 * MTN Money, or Visa/Mastercard.
 *
 * POST body: { order_id, amount, customer_email, customer_phone, customer_name }
 * Response:  { checkout_url, reference }
 *
 * Env vars required:
 *   GENIUSPAY_API_KEY      (pk_sandbox_xxx or pk_live_xxx)
 *   GENIUSPAY_API_SECRET   (sk_sandbox_xxx or sk_live_xxx)
 *   APP_URL                (e.g. https://chanoatech.com)
 *
 * Docs: https://pay.genius.ci/docs/api
 */

import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'

const GENIUSPAY_API = 'https://pay.genius.ci/api/v1/merchant/payments'
const MIN_AMOUNT_XOF = 200 // GeniusPay minimum per docs

Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { order_id, amount, customer_email, customer_phone, customer_name } = await req.json()

    if (!order_id || !amount || !customer_email) {
      return new Response(JSON.stringify({ error: 'Missing required fields: order_id, amount, customer_email' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const amountInt = Math.round(Number(amount))
    if (isNaN(amountInt) || amountInt < MIN_AMOUNT_XOF) {
      return new Response(JSON.stringify({ error: `Amount must be at least ${MIN_AMOUNT_XOF} XOF` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey    = Deno.env.get('GENIUSPAY_API_KEY')
    const apiSecret = Deno.env.get('GENIUSPAY_API_SECRET')
    const appUrl    = Deno.env.get('APP_URL') ?? 'https://chanoatech.com'

    if (!apiKey || !apiSecret) {
      console.error('Missing GeniusPay credentials')
      return new Response(JSON.stringify({ error: 'Payment provider not configured' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const shortId = String(order_id).slice(0, 8).toUpperCase()

    // Omit payment_method → GeniusPay hosted checkout (best conversion)
    const body = {
      amount: amountInt,
      currency: 'XOF',
      description: `Commande Chanoa Tech #${shortId}`,
      customer: {
        name: customer_name || '',
        email: customer_email,
        phone: customer_phone || '',
        country: 'CI',
      },
      success_url: `${appUrl}/commande/${order_id}?payment=success`,
      error_url:   `${appUrl}/checkout?error=payment_failed&order=${order_id}`,
      metadata: {
        order_id,
        customer_email,
      },
    }

    const res = await fetch(GENIUSPAY_API, {
      method: 'POST',
      headers: {
        'X-API-Key':    apiKey,
        'X-API-Secret': apiSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data.success) {
      console.error('GeniusPay error:', res.status, JSON.stringify(data))
      return new Response(JSON.stringify({
        error: data?.message ?? data?.error?.message ?? 'GeniusPay API error',
        code: data?.error?.code ?? data?.code,
        details: data,
      }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const checkoutUrl = data.data?.checkout_url ?? data.data?.payment_url
    const reference   = data.data?.reference
    const environment = data.data?.environment // 'sandbox' or 'live'

    if (!checkoutUrl || !reference) {
      console.error('Missing checkout_url or reference in GeniusPay response:', data)
      return new Response(JSON.stringify({ error: 'Invalid GeniusPay response' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Store reference on order for webhook matching
    const supabase = createServiceClient()
    const { error: updateError } = await supabase
      .from('orders')
      .update({ payment_reference: reference })
      .eq('id', order_id)

    if (updateError) {
      console.error('Failed to update order payment_reference:', updateError)
      // Continue anyway — webhook can fallback to metadata.order_id
    }

    console.log(`GeniusPay initiated: order=${order_id} ref=${reference} env=${environment}`)
    return new Response(JSON.stringify({ checkout_url: checkoutUrl, reference }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('payment-initiate error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
