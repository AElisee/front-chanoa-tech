/**
 * EF-04 — generate-invoice
 *
 * Triggered by: Database Webhook → UPDATE on public.orders (column: status)
 * Fires when status becomes 'confirmed'.
 *
 * Actions:
 *   1. Builds a PDF invoice with pdf-lib
 *   2. Uploads PDF to Supabase Storage → invoices/{order_id}.pdf
 *   3. Updates orders.invoice_url
 *   4. Sends PDF as email attachment via Resend
 *
 * Setup in Supabase:
 *   Dashboard → Database → Webhooks → Create
 *   Table: orders  |  Events: UPDATE  |  Column filter: status
 *   URL: https://<project>.supabase.co/functions/v1/generate-invoice
 *
 * Env vars required:
 *   RESEND_API_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SUPABASE_URL
 */

import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { sendEmail } from '../_shared/resend.ts'

// pdf-lib via esm.sh (Deno compatible)
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1'

const BRAND_R = 15 / 255   // #0F3460
const BRAND_G = 52 / 255
const BRAND_B = 96 / 255

function fcfa(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'
}

function drawLine(page: ReturnType<PDFDocument['addPage']>, x1: number, y: number, x2: number, thickness = 0.5) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness, color: rgb(0.85, 0.85, 0.85) })
}

async function buildInvoicePdf(data: {
  invoiceNumber: string
  date: string
  orderId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  address: string
  city: string
  items: Array<{ name: string; qty: number; unitPrice: number; total: number }>
  subtotal: number
}): Promise<Uint8Array> {
  const doc     = await PDFDocument.create()
  const page    = doc.addPage([595, 842]) // A4
  const boldF   = await doc.embedFont(StandardFonts.HelveticaBold)
  const regularF = await doc.embedFont(StandardFonts.Helvetica)

  const { width, height } = page.getSize()
  const marginX = 50
  let y = height - 50

  // ── Header band ─────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: rgb(BRAND_R, BRAND_G, BRAND_B) })
  page.drawText('Chanoa Tech', { x: marginX, y: height - 40, size: 22, font: boldF, color: rgb(1, 1, 1) })
  page.drawText('Votre partenaire informatique en Afrique', { x: marginX, y: height - 58, size: 9, font: regularF, color: rgb(0.8, 0.85, 0.95) })
  page.drawText('contact@chanoatech.com', { x: width - 220, y: height - 40, size: 9, font: regularF, color: rgb(0.8, 0.85, 0.95) })
  page.drawText('www.chanoatech.com', { x: width - 220, y: height - 56, size: 9, font: regularF, color: rgb(0.8, 0.85, 0.95) })
  y = height - 100

  // ── Invoice title ────────────────────────────────────────────────────────────
  page.drawText('FACTURE', { x: marginX, y, size: 16, font: boldF, color: rgb(BRAND_R, BRAND_G, BRAND_B) })
  page.drawText(`N° ${data.invoiceNumber}`, { x: marginX, y: y - 18, size: 10, font: boldF, color: rgb(0.3, 0.3, 0.3) })
  page.drawText(`Date : ${data.date}`, { x: width - 180, y, size: 9, font: regularF, color: rgb(0.4, 0.4, 0.4) })
  page.drawText(`Réf commande : #${data.orderId.slice(0, 8).toUpperCase()}`, { x: width - 180, y: y - 14, size: 9, font: regularF, color: rgb(0.4, 0.4, 0.4) })
  y -= 50

  // ── Client info box ──────────────────────────────────────────────────────────
  page.drawRectangle({ x: marginX, y: y - 70, width: 220, height: 80, borderColor: rgb(0.85, 0.85, 0.85), borderWidth: 0.5, color: rgb(0.97, 0.97, 0.99) })
  page.drawText('FACTURER À', { x: marginX + 10, y: y - 14, size: 7, font: boldF, color: rgb(BRAND_R, BRAND_G, BRAND_B) })
  page.drawText(data.clientName || 'Client', { x: marginX + 10, y: y - 26, size: 9, font: boldF, color: rgb(0.2, 0.2, 0.2) })
  page.drawText(data.clientEmail, { x: marginX + 10, y: y - 38, size: 8, font: regularF, color: rgb(0.4, 0.4, 0.4) })
  if (data.clientPhone) page.drawText(data.clientPhone, { x: marginX + 10, y: y - 50, size: 8, font: regularF, color: rgb(0.4, 0.4, 0.4) })
  page.drawText(`${data.address}${data.city ? ', ' + data.city : ''}`, { x: marginX + 10, y: y - 62, size: 8, font: regularF, color: rgb(0.4, 0.4, 0.4) })
  y -= 90

  // ── Table header ─────────────────────────────────────────────────────────────
  page.drawRectangle({ x: marginX, y: y - 4, width: width - 2 * marginX, height: 20, color: rgb(BRAND_R, BRAND_G, BRAND_B) })
  const cols = [marginX + 8, marginX + 290, marginX + 360, marginX + 430]
  const headers = ['Désignation', 'Qté', 'Prix unitaire', 'Total']
  headers.forEach((h, i) => {
    page.drawText(h, { x: cols[i], y: y + 2, size: 8, font: boldF, color: rgb(1, 1, 1) })
  })
  y -= 6

  // ── Table rows ───────────────────────────────────────────────────────────────
  for (const item of data.items) {
    y -= 18
    drawLine(page, marginX, y + 12, width - marginX)
    // Truncate long names
    const maxLen = 50
    const name = item.name.length > maxLen ? item.name.slice(0, maxLen) + '…' : item.name
    page.drawText(name, { x: cols[0], y, size: 8, font: regularF, color: rgb(0.2, 0.2, 0.2) })
    page.drawText(String(item.qty), { x: cols[1], y, size: 8, font: regularF, color: rgb(0.2, 0.2, 0.2) })
    page.drawText(fcfa(item.unitPrice), { x: cols[2], y, size: 8, font: regularF, color: rgb(0.2, 0.2, 0.2) })
    page.drawText(fcfa(item.total), { x: cols[3], y, size: 8, font: boldF, color: rgb(0.2, 0.2, 0.2) })
  }
  y -= 10

  // ── Totals ───────────────────────────────────────────────────────────────────
  drawLine(page, marginX, y, width - marginX, 1)
  y -= 20
  page.drawText('Sous-total articles', { x: width - 230, y, size: 9, font: regularF, color: rgb(0.4, 0.4, 0.4) })
  page.drawText(fcfa(data.subtotal), { x: cols[3], y, size: 9, font: regularF, color: rgb(0.3, 0.3, 0.3) })
  y -= 16
  page.drawText('Frais de livraison', { x: width - 230, y, size: 9, font: regularF, color: rgb(0.4, 0.4, 0.4) })
  page.drawText('À confirmer', { x: cols[3], y, size: 9, font: regularF, color: rgb(0.5, 0.5, 0.5) })
  y -= 8

  // Total TTC box
  page.drawRectangle({ x: width - 250, y: y - 6, width: 200, height: 22, color: rgb(0.94, 0.96, 1) })
  y -= 2
  page.drawText('TOTAL TTC', { x: width - 240, y, size: 10, font: boldF, color: rgb(BRAND_R, BRAND_G, BRAND_B) })
  page.drawText(fcfa(data.subtotal), { x: cols[3], y, size: 10, font: boldF, color: rgb(BRAND_R, BRAND_G, BRAND_B) })

  // ── Footer ───────────────────────────────────────────────────────────────────
  y = 60
  drawLine(page, marginX, y, width - marginX, 0.5)
  y -= 16
  page.drawText('Chanoa Tech · contact@chanoatech.com · www.chanoatech.com', { x: marginX, y, size: 7, font: regularF, color: rgb(0.5, 0.5, 0.5) })
  page.drawText('Document généré automatiquement — non soumis à la TVA', { x: marginX, y: y - 12, size: 7, font: regularF, color: rgb(0.6, 0.6, 0.6) })

  return await doc.save()
}

// ─── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const payload   = await req.json()
    const newRecord = payload.record ?? payload
    const oldRecord = payload.old_record ?? {}

    // Only fire when status transitions TO 'confirmed'
    if (newRecord.status !== 'confirmed' || oldRecord.status === 'confirmed') {
      return new Response(JSON.stringify({ skipped: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createServiceClient()

    const { data: order } = await supabase
      .from('orders')
      .select(`
        id, total, created_at, shipping_address,
        order_items(quantity, unit_price, product_snapshot),
        profiles(full_name, email, phone)
      `)
      .eq('id', newRecord.id)
      .single()

    if (!order) throw new Error('Order not found: ' + newRecord.id)

    type ItemRow  = { quantity: number; unit_price: number; product_snapshot: { name: string } }
    type Profile  = { full_name: string | null; email: string; phone: string | null } | null

    const items   = (order.order_items ?? []) as ItemRow[]
    const profile = order.profiles as unknown as Profile
    const addr    = order.shipping_address as { full_name?: string; email?: string; phone?: string; address?: string; city?: string } | null

    const clientEmail = profile?.email ?? addr?.email
    if (!clientEmail) throw new Error('No email for order ' + order.id)

    const year         = new Date(order.created_at).getFullYear()
    const invoiceNumber = `CT-${year}-${order.id.slice(0, 8).toUpperCase()}`
    const invoiceDate   = new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })

    const itemsForPdf = items.map((i) => ({
      name:      i.product_snapshot?.name ?? 'Produit',
      qty:       i.quantity,
      unitPrice: Number(i.unit_price),
      total:     Number(i.unit_price) * i.quantity,
    }))

    // Build PDF
    const pdfBytes = await buildInvoicePdf({
      invoiceNumber,
      date:        invoiceDate,
      orderId:     order.id,
      clientName:  profile?.full_name ?? addr?.full_name ?? '',
      clientEmail,
      clientPhone: profile?.phone ?? addr?.phone ?? '',
      address:     addr?.address ?? '',
      city:        addr?.city ?? '',
      items:       itemsForPdf,
      subtotal:    Number(order.total),
    })

    // Upload to Supabase Storage
    const fileName = `${order.id}.pdf`
    const { error: uploadError } = await supabase
      .storage
      .from('invoices')
      .upload(fileName, pdfBytes, { contentType: 'application/pdf', upsert: true })

    if (uploadError) throw new Error('Storage upload failed: ' + uploadError.message)

    const { data: { publicUrl } } = supabase.storage.from('invoices').getPublicUrl(fileName)

    // Save invoice_url to order
    await supabase.from('orders').update({ invoice_url: publicUrl }).eq('id', order.id)

    // Send email with PDF attachment (base64)
    const pdfBase64 = btoa(String.fromCharCode(...pdfBytes))
    await sendEmail({
      to:      clientEmail,
      subject: `Votre facture Chanoa Tech — ${invoiceNumber}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
          <h2 style="color:#0F3460">Votre facture est prête</h2>
          <p>Bonjour${profile?.full_name ? ` <strong>${profile.full_name}</strong>` : ''},</p>
          <p>Veuillez trouver ci-joint la facture de votre commande <strong>#${order.id.slice(0, 8).toUpperCase()}</strong>.</p>
          <p>Vous pouvez également la <a href="${publicUrl}" style="color:#0F3460">télécharger ici</a>.</p>
          <br/><p style="color:#888;font-size:12px">Chanoa Tech · contact@chanoatech.com</p>
        </div>`,
      attachments: [{ filename: `facture-${invoiceNumber}.pdf`, content: pdfBase64 }],
    })

    console.log(`Invoice generated: ${invoiceNumber} for order ${order.id}`)
    return new Response(JSON.stringify({ ok: true, invoiceNumber, publicUrl }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Invoice error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
