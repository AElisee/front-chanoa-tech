import Link from 'next/link'
import type { Metadata } from 'next'
import { CheckCircle, Package, Truck, Mail, ArrowRight, Phone, Lock, CreditCard, Banknote } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatFCFA } from '@/lib/utils/format'
import OtpTrackingBanner from './OtpTrackingBanner'
import ClearCartOnMount from './ClearCartOnMount'

export const metadata: Metadata = { title: 'Commande confirmée — Chanoa Tech' }

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string; payment?: string }>
}

export default async function OrderConfirmationPage({ params, searchParams }: Props) {
  const { id } = await params
  const { email: emailParam } = await searchParams

  // Check if user is authenticated
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  const authEmail = user?.email?.toLowerCase() ?? null

  // Load order using service role (guest may not be auth'd)
  const { createClient: createServiceClient } = await import('@supabase/supabase-js')
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, status, total, shipping_address, created_at, notes, user_id, guest_email, payment_method,
      order_items(quantity, unit_price, product_snapshot)
    `)
    .eq('id', id)
    .single()

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-lg font-medium text-muted-foreground">Commande introuvable.</p>
        <Link href="/boutique" className="text-sm font-medium text-primary hover:underline">
          Retour à la boutique
        </Link>
      </div>
    )
  }

  const address = order.shipping_address as {
    full_name?: string
    email?: string
    phone?: string
    address?: string
    city?: string
  }

  // ── SECURITY: verify ownership before exposing PII ───────────────
  const orderEmail = (order.guest_email ?? address.email ?? '').toLowerCase()
  const providedEmail = (emailParam ?? '').toLowerCase()
  const isOwner =
    (order.user_id && user && order.user_id === user.id) ||          // authenticated owner
    (authEmail && orderEmail && authEmail === orderEmail) ||          // auth'd email match
    (providedEmail && orderEmail && providedEmail === orderEmail)     // guest email link match

  if (!isOwner) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <Lock className="h-7 w-7 text-amber-600" />
        </div>
        <h1 className="text-xl font-bold">Accès restreint</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pour voir le détail de cette commande, veuillez vous connecter avec le compte utilisé lors de l&apos;achat,
          ou utiliser le lien de suivi reçu par email.
        </p>
        <div className="mt-6 flex flex-col items-center gap-2">
          <Link
            href={`/auth/login?redirect=/commande/${id}`}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Se connecter
          </Link>
          <Link href="/boutique" className="text-xs text-muted-foreground hover:text-primary">
            Retour à la boutique
          </Link>
        </div>
      </div>
    )
  }

  const items = order.order_items as Array<{
    quantity: number
    unit_price: number
    product_snapshot: { name: string; price: number; slug: string }
  }>

  const shortId = order.id.slice(0, 8).toUpperCase()
  const guestEmail = address.email ?? null
  const isCashOnDelivery = order.payment_method === 'cash_on_delivery'

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <ClearCartOnMount />
      {/* Success header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Demande confirmée !</h1>
        <p className="mt-2 text-muted-foreground">
          Votre commande <span className="font-semibold text-foreground">#{shortId}</span> a bien été enregistrée.
        </p>
        {guestEmail && (
          <p className="mt-1 text-sm text-muted-foreground">
            Un récapitulatif sera envoyé à <span className="font-medium">{guestEmail}</span>
          </p>
        )}
      </div>

      {/* Mode de paiement */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {isCashOnDelivery ? <Banknote className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Mode de paiement
          </p>
          <p className="text-sm font-medium text-foreground">
            {isCashOnDelivery ? 'Paiement à la livraison (espèces)' : 'Paiement en ligne — GeniusPay'}
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="mb-8 rounded-xl border bg-blue-50 p-5">
        <p className="mb-3 text-sm font-semibold text-blue-800">Prochaines étapes</p>
        <div className="space-y-2.5">
          {(isCashOnDelivery
            ? [
                { icon: Phone,   text: 'Notre équipe vous appelle sous 24h pour confirmer votre commande.' },
                { icon: Package, text: 'Préparation de votre commande dès la confirmation.' },
                { icon: Truck,   text: 'Livraison à votre adresse — réglez le livreur en espèces.' },
                { icon: Mail,    text: 'Reçu de paiement envoyé par email après la livraison.' },
              ]
            : [
                { icon: Mail,    text: 'Notre équipe vous contacte sous 24h pour confirmer votre commande.' },
                { icon: Phone,   text: 'Si le paiement n\'a pas abouti, nous vous recontactons sous 24h.' },
                { icon: Truck,   text: 'Dès réception du paiement, votre commande est préparée et expédiée.' },
                { icon: Package, text: 'Livraison à votre adresse avec numéro de suivi.' },
              ]
          ).map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-800">
                {i + 1}
              </div>
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <p className="text-sm text-blue-800">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OTP tracking banner (client component) */}
      {guestEmail && <OtpTrackingBanner email={guestEmail} />}

      {/* Order details */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Détail de la commande #{shortId}</h2>
        </div>

        {/* Items */}
        <div className="divide-y px-5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{item.product_snapshot.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFCFA(item.unit_price)} × {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold">
                {formatFCFA(item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between border-t bg-muted/30 px-5 py-4">
          <span className="font-semibold">Total articles</span>
          <span className="text-lg font-bold text-action">{formatFCFA(order.total)}</span>
        </div>

        {/* Delivery address */}
        {(address.city || address.address) && (
          <div className="border-t px-5 py-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Livraison
            </p>
            <p className="text-sm">
              {address.full_name && <span className="font-medium">{address.full_name} — </span>}
              {address.address}{address.city && `, ${address.city}`}
            </p>
            {address.phone && (
              <p className="mt-0.5 text-sm text-muted-foreground">{address.phone}</p>
            )}
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/boutique"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Continuer mes achats <ArrowRight className="h-4 w-4" />
        </Link>
        <a
          href={`mailto:contact@chanoa-tech.com?subject=Suivi commande ${shortId}&body=Bonjour,%0A%0AJe souhaite des informations sur ma commande #${shortId}.%0A%0AMerci.`}
          className="inline-flex items-center gap-2 rounded-md border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Mail className="h-4 w-4" />
          Contacter le support
        </a>
      </div>
    </div>
  )
}
