import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react'
import { guardAdmin } from '@/lib/supabase/server'
import { formatFCFA } from '@/lib/utils/format'
import { OrderStatusBadge } from '@/components/store/OrderStatusBadge'
import type { OrderStatus } from '@/lib/supabase/types'

export const metadata: Metadata = { title: 'Profil client — Admin' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminClientDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await guardAdmin()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-muted-foreground">Client introuvable.</p>
        <Link href="/admin/clients" className="text-sm text-primary hover:underline">← Retour</Link>
      </div>
    )
  }

  // Load orders: both linked (user_id) AND guest orders matching this email
  const { data: ordersByUser } = await supabase
    .from('orders')
    .select('id, status, total, created_at, user_id, guest_email, shipping_address')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const { data: ordersByEmailRaw } = profile.email ? await supabase
    .from('orders')
    .select('id, status, total, created_at, user_id, guest_email, shipping_address')
    .ilike('guest_email', profile.email)
    .is('user_id', null)
    .order('created_at', { ascending: false }) : { data: null as null }

  type OrderRow = { id: string; status: string; total: number; created_at: string; user_id: string | null; guest_email: string | null; shipping_address: { email?: string } | null }
  const seen = new Set<string>()
  const orderList: OrderRow[] = []
  for (const o of [...((ordersByUser ?? []) as OrderRow[]), ...((ordersByEmailRaw ?? []) as OrderRow[])]) {
    if (!seen.has(o.id)) { seen.add(o.id); orderList.push(o) }
  }
  orderList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const totalSpent = orderList.reduce((s, o) => s + Number(o.total), 0)

  // Load item counts per order (separate query since join fails with service role)
  const orderIds = orderList.map((o) => o.id)
  const itemCounts = new Map<string, number>()
  if (orderIds.length > 0) {
    const { data: items } = await supabase
      .from('order_items')
      .select('order_id')
      .in('order_id', orderIds)
    for (const it of (items ?? []) as { order_id: string }[]) {
      itemCounts.set(it.order_id, (itemCounts.get(it.order_id) ?? 0) + 1)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/clients" className="rounded-md border p-1.5 hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold">{profile.full_name ?? profile.email}</h1>
        {profile.role === 'admin' && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Admin</span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Profile card */}
        <div className="md:col-span-1">
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold">Informations</h2>
            </div>
            <div className="space-y-3 px-5 py-4 text-sm">
              {profile.full_name && (
                <p className="font-medium text-base">{profile.full_name}</p>
              )}
              <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="break-all">{profile.email}</span>
              </a>
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                  <Phone className="h-4 w-4 shrink-0" />
                  {profile.phone}
                </a>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                Inscrit le {new Date(profile.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>

            {/* Stats */}
            <div className="border-t grid grid-cols-2 divide-x">
              <div className="px-4 py-3 text-center">
                <p className="text-2xl font-bold text-primary">{orderList.length}</p>
                <p className="text-xs text-muted-foreground">Commandes</p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-lg font-bold text-primary">{totalSpent > 0 ? formatFCFA(totalSpent) : '—'}</p>
                <p className="text-xs text-muted-foreground">Total dépensé</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="md:col-span-2">
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b px-5 py-4">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold">Historique des commandes</h2>
            </div>
            {orderList.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">Aucune commande.</p>
            ) : (
              <div className="divide-y">
                {orderList.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/commandes/${order.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {(() => { const n = itemCounts.get(order.id) ?? 0; return n > 0 ? ` · ${n} article${n > 1 ? 's' : ''}` : '' })()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{formatFCFA(order.total)}</span>
                      <OrderStatusBadge status={order.status as OrderStatus} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
