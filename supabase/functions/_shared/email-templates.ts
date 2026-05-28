const BRAND_COLOR  = '#0F3460'
const ACCENT_COLOR = '#E94560'
const BASE_URL     = Deno.env.get('APP_URL') ?? 'https://chanoatech.com'

function baseLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; color: #333; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
  .card    { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
  .header  { background: ${BRAND_COLOR}; padding: 24px 32px; text-align: center; }
  .header h1 { color: #fff; font-size: 22px; font-weight: 700; letter-spacing: .5px; }
  .header p  { color: rgba(255,255,255,.7); font-size: 13px; margin-top: 4px; }
  .body    { padding: 32px; }
  .table   { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
  .table th { background: #f9fafb; padding: 10px 12px; text-align: left; font-weight: 600; color: #555; border-bottom: 1px solid #eee; }
  .table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
  .total   { font-size: 16px; font-weight: 700; color: ${BRAND_COLOR}; }
  .badge   { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .btn     { display: inline-block; padding: 12px 28px; background: ${ACCENT_COLOR}; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 16px 0; }
  .info-box { background: #f0f4ff; border-left: 4px solid ${BRAND_COLOR}; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
  .footer  { text-align: center; padding: 20px; color: #888; font-size: 12px; }
  .divider { border: none; border-top: 1px solid #eee; margin: 20px 0; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <h1>Chanoa Tech</h1>
      <p>Votre partenaire informatique en Afrique</p>
    </div>
    <div class="body">${body}</div>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Chanoa Tech · <a href="${BASE_URL}" style="color:${BRAND_COLOR}">chanoatech.com</a></p>
    <p style="margin-top:4px">Des questions ? <a href="mailto:contact@chanoatech.com" style="color:${BRAND_COLOR}">contact@chanoatech.com</a></p>
  </div>
</div>
</body>
</html>`
}

function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA'
}

// ─── EF-01: Order confirmation ────────────────────────────────────────────────

interface OrderItem {
  name: string
  quantity: number
  unit_price: number
}

interface OrderEmailData {
  orderId: string
  shortId: string
  clientName: string
  items: OrderItem[]
  total: number
  address: string
  city: string
  phone?: string
}

export function orderConfirmationEmail(data: OrderEmailData): { subject: string; html: string } {
  const itemRows = data.items.map((item) => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${formatFCFA(item.unit_price)}</td>
      <td style="text-align:right;font-weight:600">${formatFCFA(item.unit_price * item.quantity)}</td>
    </tr>`).join('')

  const body = `
    <h2 style="color:${BRAND_COLOR};margin-bottom:8px">Demande confirmée !</h2>
    <p style="color:#555;margin-bottom:24px">
      Bonjour${data.clientName ? ` <strong>${data.clientName}</strong>` : ''},<br/>
      Votre commande <strong>#${data.shortId}</strong> a bien été enregistrée.
      Notre équipe vous contactera sous 24h pour finaliser le paiement.
    </p>

    <div class="info-box">
      <p style="font-size:13px;color:#555">Prochaines étapes :</p>
      <ol style="margin-top:8px;padding-left:20px;font-size:13px;color:#444;line-height:1.8">
        <li>Notre équipe vous contacte sous 24h</li>
        <li>Vous recevez les modalités de paiement (Wave, Orange Money, virement)</li>
        <li>Livraison organisée dès réception du paiement</li>
      </ol>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Produit</th>
          <th style="text-align:center">Qté</th>
          <th style="text-align:right">Prix unitaire</th>
          <th style="text-align:right">Sous-total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="text-align:right;font-weight:600;padding-top:12px">Total articles</td>
          <td style="text-align:right;padding-top:12px" class="total">${formatFCFA(data.total)}</td>
        </tr>
      </tfoot>
    </table>

    <hr class="divider" />

    <p style="font-size:13px;color:#666;margin-bottom:6px"><strong>Adresse de livraison</strong></p>
    <p style="font-size:14px">${data.address}${data.city ? `, ${data.city}` : ''}${data.phone ? `<br/>${data.phone}` : ''}</p>

    <div style="text-align:center;margin-top:28px">
      <a href="${BASE_URL}/commande/${data.orderId}" class="btn">Voir ma commande</a>
    </div>
  `

  return {
    subject: `Commande #${data.shortId} confirmée — Chanoa Tech`,
    html: baseLayout(`Commande #${data.shortId}`, body),
  }
}

// ─── EF-02: Status update emails ──────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { badge: string; badgeBg: string; headline: string; detail: string }> = {
  confirmed: {
    badge: 'Confirmée', badgeBg: '#2563eb',
    headline: 'Votre commande est confirmée',
    detail: 'Le paiement a été reçu. Votre commande est maintenant en cours de préparation.',
  },
  shipped: {
    badge: 'Expédiée', badgeBg: '#7c3aed',
    headline: 'Votre commande est en route',
    detail: 'Votre commande a été expédiée et est en chemin vers vous.',
  },
  delivered: {
    badge: 'Livrée', badgeBg: '#16a34a',
    headline: 'Votre commande a été livrée',
    detail: 'Merci pour votre confiance ! Nous espérons que vous êtes satisfait de votre achat.',
  },
  cancelled: {
    badge: 'Annulée', badgeBg: '#dc2626',
    headline: 'Votre commande a été annulée',
    detail: 'Votre commande a été annulée. Si vous avez des questions, contactez notre support.',
  },
}

interface StatusEmailData {
  orderId: string
  shortId: string
  clientName: string
  newStatus: string
  total: number
  trackingNumber?: string | null
  carrier?: string | null
}

export function statusUpdateEmail(data: StatusEmailData): { subject: string; html: string } | null {
  const config = STATUS_CONFIG[data.newStatus]
  if (!config) return null

  const trackingBlock = data.newStatus === 'shipped' && data.trackingNumber ? `
    <div class="info-box" style="margin-top:20px">
      <p style="font-size:13px;font-weight:600;color:${BRAND_COLOR}">Informations de suivi</p>
      ${data.carrier ? `<p style="font-size:13px;margin-top:4px">Transporteur : <strong>${data.carrier}</strong></p>` : ''}
      <p style="font-size:13px;margin-top:4px">N° de suivi : <strong>${data.trackingNumber}</strong></p>
    </div>` : ''

  const body = `
    <div style="text-align:center;margin-bottom:24px">
      <span class="badge" style="background:${config.badgeBg};color:#fff;font-size:14px;padding:6px 18px">${config.badge}</span>
    </div>
    <h2 style="color:${BRAND_COLOR};margin-bottom:8px">${config.headline}</h2>
    <p style="color:#555;margin-bottom:16px">
      Bonjour${data.clientName ? ` <strong>${data.clientName}</strong>` : ''},<br/>
      ${config.detail}
    </p>
    <p style="font-size:13px;color:#888">Commande : <strong>#${data.shortId}</strong> · Total : <strong>${formatFCFA(data.total)}</strong></p>
    ${trackingBlock}
    <div style="text-align:center;margin-top:28px">
      <a href="${BASE_URL}/commande/${data.orderId}" class="btn">Voir ma commande</a>
    </div>
    ${data.newStatus === 'delivered' ? `
    <hr class="divider"/>
    <p style="text-align:center;font-size:13px;color:#888">
      Vous avez apprécié votre achat ? Parlez-en autour de vous !<br/>
      <a href="${BASE_URL}/boutique" style="color:${BRAND_COLOR}">Découvrir d'autres produits →</a>
    </p>` : ''}
  `

  return {
    subject: `Commande #${data.shortId} — ${config.headline}`,
    html: baseLayout(`Commande #${data.shortId}`, body),
  }
}
