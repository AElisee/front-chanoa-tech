import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OrderStatusBadge } from '@/components/store/OrderStatusBadge'
import { formatFCFA } from '@/lib/utils/format'
import type { OrderStatus } from '@/lib/supabase/types'

export const metadata: Metadata = { title: 'Mes commandes — Chanoa Tech' }

export default async function CommandesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/compte/commandes')

  const userEmail = user.email?.toLowerCase()

  // Load orders linked by user_id OR by matching email (guest orders placed before signup)
  const [ownedRes, guestRes] = await Promise.all([
    supabase
      .from('orders')
      .select(`
        id, status, total, created_at, user_id, guest_email,
        order_items(id, quantity, unit_price, product_snapshot),
        deliveries(carrier, tracking_number)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    userEmail ? supabase
      .from('orders')
      .select(`
        id, status, total, created_at, user_id, guest_email,
        order_items(id, quantity, unit_price, product_snapshot),
        deliveries(carrier, tracking_number)
      `)
      .is('user_id', null)
      .ilike('guest_email', userEmail)
      .order('created_at', { ascending: false }) : Promise.resolve({ data: null }),
  ])

  type OrderRow = {
    id: string
    status: string
    total: number
    created_at: string
    user_id: string | null
    guest_email: string | null
    order_items: Array<{
      id: string
      quantity: number
      unit_price: number
      product_snapshot: { name?: string }
    }>
    deliveries: Array<{ carrier: string | null; tracking_number: string | null }>
  }

  // Merge + dedupe
  const seen = new Set<string>()
  const list: OrderRow[] = []
  for (const o of [...(ownedRes.data ?? []), ...(guestRes.data ?? [])] as OrderRow[]) {
    if (!seen.has(o.id)) { seen.add(o.id); list.push(o) }
  }
  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">Mes commandes</h1>

      {list.length === 0 ? (
        <p className="text-muted-foreground">Vous n&apos;avez encore passé aucune commande.</p>
      ) : (
        <div className="space-y-4">
          {list.map((order) => (
            <div key={order.id} className="rounded-xl border bg-white shadow-sm">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3">
                <div>
                  <p className="text-sm font-semibold">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary">{formatFCFA(order.total)}</span>
                  <OrderStatusBadge status={order.status as OrderStatus} />
                </div>
              </div>

              {/* Items */}
              <div className="divide-y px-5">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 text-sm">
                    <span>{item.product_snapshot?.name ?? 'Produit'} × {item.quantity}</span>
                    <span className="font-medium">
                      {formatFCFA(item.unit_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tracking */}
              {order.deliveries?.[0] && (
                <div className="border-t px-5 py-3 text-xs text-muted-foreground">
                  Suivi : {order.deliveries[0].carrier ?? '—'}{' '}
                  {order.deliveries[0].tracking_number
                    ? `· ${order.deliveries[0].tracking_number}`
                    : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
