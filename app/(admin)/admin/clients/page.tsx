import Link from 'next/link'
import type { Metadata } from 'next'
import { Search, Users, Mail, Phone as PhoneIcon } from 'lucide-react'
import { guardAdmin } from '@/lib/supabase/server'
import { formatFCFA } from '@/lib/utils/format'

export const metadata: Metadata = { title: 'Clients — Admin' }

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function AdminClientsPage({ searchParams }: Props) {
  const { q } = await searchParams
  const supabase = await guardAdmin()

  // Load profiles and ALL orders (both authenticated and guest)
  const [{ data: profiles }, { data: allOrders }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, phone, created_at, role')
      .neq('role', 'admin') // exclude admins, keep 'user' and null roles
      .order('created_at', { ascending: false }),
    supabase
      .from('orders')
      .select('id, user_id, guest_email, shipping_address, total, status, created_at'),
  ])

  type Order = { id: string; user_id: string | null; guest_email: string | null; shipping_address: { email?: string } | null; total: number; status: string; created_at: string }

  // Group orders by both user_id AND email (to catch guest orders)
  const ordersByUser = new Map<string, Order[]>()
  const ordersByEmail = new Map<string, Order[]>()
  for (const o of (allOrders ?? []) as Order[]) {
    if (o.user_id) {
      const list = ordersByUser.get(o.user_id) ?? []
      list.push(o)
      ordersByUser.set(o.user_id, list)
    }
    const emailKey = (o.guest_email ?? o.shipping_address?.email ?? '').toLowerCase()
    if (emailKey) {
      const list = ordersByEmail.get(emailKey) ?? []
      list.push(o)
      ordersByEmail.set(emailKey, list)
    }
  }

  type ClientRow = {
    id: string
    full_name: string | null
    email: string
    phone: string | null
    created_at: string
    orders: Order[]
  }

  let clients: ClientRow[] = ((profiles ?? []) as Array<{
    id: string; full_name: string | null; email: string; phone: string | null; created_at: string
  }>).map((p) => {
    // Merge: orders linked by user_id + guest orders matching this email
    const byId = ordersByUser.get(p.id) ?? []
    const byEmail = ordersByEmail.get(p.email.toLowerCase()) ?? []
    // Deduplicate (same order could be both linked and guest)
    const seen = new Set<string>()
    const merged: Order[] = []
    for (const o of [...byId, ...byEmail]) {
      if (!seen.has(o.id)) { seen.add(o.id); merged.push(o) }
    }
    return { ...p, orders: merged }
  })

  if (q) {
    const lower = q.toLowerCase()
    clients = clients.filter((c) =>
      c.full_name?.toLowerCase().includes(lower) ||
      c.email.toLowerCase().includes(lower) ||
      c.phone?.includes(lower)
    )
  }

  // Sort: clients with orders first
  clients.sort((a, b) => b.orders.length - a.orders.length)

  const totalClients = clients.length
  const clientsWithOrders = clients.filter((c) => c.orders.length > 0).length
  const totalRevenue = clients.reduce((s, c) => s + c.orders.reduce((ss, o) => ss + Number(o.total), 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalClients} client{totalClients > 1 ? 's' : ''} inscrit{totalClients > 1 ? 's' : ''} · {clientsWithOrders} ont déjà commandé · CA total {formatFCFA(totalRevenue)}
        </p>
      </div>

      {/* Search */}
      <form method="GET" className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher par nom, email, téléphone…"
            className="w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </form>

      {/* Clients grid */}
      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-white py-20 text-center shadow-sm">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Users className="h-7 w-7 text-muted-foreground/60" />
          </div>
          <p className="font-medium text-foreground">{q ? 'Aucun résultat' : 'Aucun client inscrit'}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {q ? 'Essayez une autre recherche.' : 'Les clients inscrits apparaîtront ici.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => {
            const orderCount = client.orders.length
            const totalSpent = client.orders.reduce((s, o) => s + Number(o.total), 0)
            const lastOrder = client.orders.sort((a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0]
            const initial = (client.full_name ?? client.email)[0].toUpperCase()
            return (
              <Link
                key={client.id}
                href={`/admin/clients/${client.id}`}
                className="group relative flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
              >
                {/* Header: avatar + name */}
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-[#1E4B8C] text-sm font-bold text-white shadow-sm">
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{client.full_name ?? 'Sans nom'}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Inscrit le {new Date(client.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <PhoneIcon className="h-3.5 w-3.5 shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Commandes</p>
                    <p className="text-lg font-bold">{orderCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total dépensé</p>
                    <p className={`text-lg font-bold ${totalSpent > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {totalSpent > 0 ? formatFCFA(totalSpent) : '—'}
                    </p>
                  </div>
                </div>

                {lastOrder && (
                  <p className="text-[10px] text-muted-foreground">
                    Dernière commande : {new Date(lastOrder.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
