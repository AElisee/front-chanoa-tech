import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, Package, Truck, User, MapPin, FileText, Phone, Mail, CreditCard, Banknote } from 'lucide-react'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import { formatFCFA } from '@/lib/utils/format'
import { OrderStatusBadge } from '@/components/store/OrderStatusBadge'
import type { OrderStatus } from '@/lib/api/orders'
import { updateOrderStatus, updateTracking, updateOrderNotes } from './actions'
import { cookies } from 'next/headers'
import { apiClient } from '@/lib/api/client'
import type { OrderDto } from '@/lib/api/orders'
import type { DeliveryDto } from '@/lib/api/deliveries'

export const metadata: Metadata = { title: 'Détail commande — Admin' }

const ORDER_STATUSES: { value: string; label: string; color: string }[] = [
  { value: 'pending',    label: 'En attente',      color: 'bg-yellow-500' },
  { value: 'confirmed',  label: 'Confirmé',         color: 'bg-blue-500' },
  { value: 'processing', label: 'En préparation',   color: 'bg-purple-500' },
  { value: 'shipped',    label: 'Expédié',          color: 'bg-indigo-500' },
  { value: 'delivered',  label: 'Livré',            color: 'bg-green-600' },
  { value: 'cancelled',  label: 'Annulé',           color: 'bg-red-500' },
]

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string }>
}

export default async function AdminCommandeDetailPage({ params, searchParams }: Props) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

  const { id } = await params
  const { success } = await searchParams

  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  // Charger la commande via l'API
  let order: OrderDto | null = null
  try {
    const res = await apiClient.get<OrderDto>(`/commande/${id}`, { headers })
    order = res.data
  } catch {
    // silencieux
  }

  // Charger les infos de livraison via l'API NestJS
  let deliveryRows: Pick<DeliveryDto, 'carrier' | 'tracking_number' | 'status' | 'shipped_at' | 'delivered_at'>[] = []
  try {
    const res = await apiClient.get<DeliveryDto[]>(`/deliveries/commande/${id}`, { headers })
    deliveryRows = res.data ?? []
  } catch {
    // silencieux — la livraison peut ne pas encore exister
  }

  if (!order) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Commande introuvable.</p>
        <Link href="/admin/commandes" className="text-sm text-primary hover:underline">← Retour</Link>
      </div>
    )
  }

  type ItemRow = { id: string; quantity: number; unit_price: number; product_snapshot: { name: string; slug: string }; product_id: string | null }

  const items    = (order.order_items ?? []) as unknown as ItemRow[]
  const delivery = deliveryRows[0] ?? null
  const addr       = order.shipping_address as { full_name?: string; email?: string; phone?: string; address?: string; city?: string } | null
  const shortId    = order.id.slice(0, 8).toUpperCase()

  // payment_method pas dans OrderDto standard — on cast
  const orderAny = order as OrderDto & { payment_method?: string }

  const clientName  = addr?.full_name ?? addr?.email ?? order.guest_email ?? 'Client invité'
  const clientEmail = addr?.email ?? order.guest_email ?? null
  const clientPhone = addr?.phone ?? null
  const isGuest     = !order.user_id

  const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
  const currentIdx   = STATUS_ORDER.indexOf(order.status)

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/commandes" className="rounded-md border p-1.5 hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Commande #{shortId}</h1>
            <p className="text-xs text-muted-foreground">
              Créée le {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <OrderStatusBadge status={order.status as OrderStatus} />
      </div>

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
          Mise à jour enregistrée.
        </div>
      )}

      {/* Status timeline */}
      {order.status !== 'cancelled' && (
        <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Progression</p>
          <div className="flex items-center gap-0">
            {STATUS_ORDER.map((s, i) => {
              const done    = i <= currentIdx
              const current = i === currentIdx
              const st      = ORDER_STATUSES.find((x) => x.value === s)!
              return (
                <div key={s} className="flex flex-1 flex-col items-center gap-1">
                  <div className="relative flex w-full items-center">
                    {i > 0 && <div className={`h-0.5 flex-1 ${done ? 'bg-primary' : 'bg-gray-200'}`} />}
                    <div className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${done ? st.color : 'bg-gray-200'} ${current ? 'ring-2 ring-offset-1 ring-primary' : ''}`}>
                      {i + 1}
                    </div>
                    {i < STATUS_ORDER.length - 1 && <div className={`h-0.5 flex-1 ${i < currentIdx ? 'bg-primary' : 'bg-gray-200'}`} />}
                  </div>
                  <span className={`text-[10px] text-center ${current ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{st.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left col: items + notes */}
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b px-5 py-3">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold">Articles ({items.length})</h2>
            </div>
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium">{item.product_snapshot?.name ?? 'Produit'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFCFA(item.unit_price)} × {item.quantity}
                      {item.product_id && (
                        <Link href={`/admin/produits/${item.product_id}`} className="ml-2 text-primary hover:underline">Voir produit</Link>
                      )}
                    </p>
                  </div>
                  <span className="font-semibold">{formatFCFA(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t bg-muted/20 px-5 py-3">
              <span className="font-bold">Total</span>
              <span className="text-lg font-bold text-primary">{formatFCFA(order.total)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b px-5 py-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold">Notes internes</h2>
            </div>
            <form action={updateOrderNotes} className="p-5 space-y-3">
              <input type="hidden" name="id" value={order.id} />
              <textarea
                name="notes"
                rows={3}
                defaultValue={order.notes ?? ''}
                placeholder="Notes visibles uniquement par l'équipe…"
                className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
              />
              <button type="submit" className="rounded-md bg-muted px-4 py-1.5 text-sm font-medium hover:bg-muted/70">
                Enregistrer
              </button>
            </form>
          </div>
        </div>

        {/* Right col: client, status change, tracking */}
        <div className="space-y-6">
          {/* Client */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b px-5 py-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold">Client</h2>
              {isGuest && <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">invité</span>}
            </div>
            <div className="space-y-2 px-5 py-4 text-sm">
              <p className="font-medium">{clientName}</p>
              {clientEmail && (
                <a href={`mailto:${clientEmail}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
                  <Mail className="h-3.5 w-3.5" />{clientEmail}
                </a>
              )}
              {clientPhone && (
                <a href={`tel:${clientPhone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
                  <Phone className="h-3.5 w-3.5" />{clientPhone}
                </a>
              )}
              {order.user_id && (
                <Link href={`/admin/clients/${order.user_id}`} className="mt-1 block text-xs text-primary hover:underline">
                  Voir le profil client →
                </Link>
              )}
            </div>
            {(addr?.address || addr?.city) && (
              <div className="border-t px-5 py-3">
                <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <p>
                    {addr.address}
                    {addr.city && `, ${addr.city}`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment method */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b px-5 py-3">
              {orderAny.payment_method === 'cash_on_delivery' ? (
                <Banknote className="h-4 w-4 text-muted-foreground" />
              ) : (
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              )}
              <h2 className="font-semibold">Paiement</h2>
            </div>
            <div className="px-5 py-4 text-sm">
              {orderAny.payment_method === 'cash_on_delivery' ? (
                <div>
                  <p className="font-medium">Paiement à la livraison</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Le client règle en espèces au livreur. À encaisser à la remise du colis.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">Paiement en ligne — GeniusPay</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Wave, Orange Money, MTN, Visa/Mastercard.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status change */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-5 py-3">
              <h2 className="font-semibold">Changer le statut</h2>
            </div>
            <form action={updateOrderStatus} className="p-5 space-y-3">
              <input type="hidden" name="id" value={order.id} />
              <select
                name="status"
                defaultValue={order.status}
                className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Mettre à jour
              </button>
            </form>
          </div>

          {/* Tracking */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b px-5 py-3">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold">Livraison & suivi</h2>
            </div>
            <form action={updateTracking} className="p-5 space-y-3">
              <input type="hidden" name="order_id" value={order.id} />
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Transporteur</label>
                <input
                  name="carrier"
                  defaultValue={delivery?.carrier ?? ''}
                  placeholder="Ex : DHL, COLISSIMO…"
                  className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Numéro de suivi</label>
                <input
                  name="tracking_number"
                  defaultValue={delivery?.tracking_number ?? ''}
                  placeholder="ABC123456789"
                  className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/70"
              >
                Enregistrer
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
