import Link from 'next/link'
import type { Metadata } from 'next'
import { Search } from 'lucide-react'
import { OrderStatusBadge } from '@/components/store/OrderStatusBadge'
import type { OrderStatus } from '@/lib/api/orders'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import { formatFCFA } from '@/lib/utils/format'
import { cookies } from 'next/headers'
import { apiClient } from '@/lib/api/client'
import type { OrderListResponse, OrderDto } from '@/lib/api/orders'

export const metadata: Metadata = { title: 'Commandes — Admin' }

const STATUSES: { value: string; label: string }[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'processing', label: 'En préparation' },
  { value: 'shipped', label: 'Expédié' },
  { value: 'delivered', label: 'Livré' },
  { value: 'cancelled', label: 'Annulé' },
]

interface Props {
  searchParams: Promise<{ status?: string; q?: string; updated?: string }>
}

export default async function AdminCommandesPage({ searchParams }: Props) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

  const { status, q, updated } = await searchParams

  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  let orders: OrderDto[] = []
  try {
    const apiParams: Record<string, string | number> = { limit: 500 }
    // Note : filtrage par status sera géré côté client (l'API peut ne pas exposer ce filtre)

    const res = await apiClient.get<OrderListResponse>('/commande', {
      params: apiParams,
      headers,
    })
    orders = res.data.data ?? []
  } catch (err: any) {
    console.error('Admin orders query error — status:', err?.response?.status)
    console.error('Admin orders query error — body:', JSON.stringify(err?.response?.data))
  }

  type OrderRow = {
    id: string
    status: string
    total: number
    created_at: string
    user_id: string | null
    guest_email: string | null
    shipping_address: { full_name?: string; email?: string; phone?: string } | null
  }

  let list: OrderRow[] = orders as OrderRow[]

  // Filtrage par statut
  if (status) {
    list = list.filter((o) => o.status === status)
  }

  // Recherche client-side
  if (q) {
    const lower = q.toLowerCase()
    list = list.filter((o) => {
      const addr = o.shipping_address
      return (
        o.id.toLowerCase().includes(lower) ||
        addr?.full_name?.toLowerCase().includes(lower) ||
        addr?.email?.toLowerCase().includes(lower) ||
        addr?.phone?.includes(lower) ||
        o.guest_email?.toLowerCase().includes(lower)
      )
    })
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Commandes</h1>
        <span className="text-sm text-muted-foreground">{list.length} résultat{list.length > 1 ? 's' : ''}</span>
      </div>

      {updated && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          <span className="text-lg">✓</span>
          Statut de la commande mis à jour avec succès.
        </div>
      )}

      {/* Status filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const isActive = (status ?? '') === s.value
          return (
            <Link
              key={s.value}
              href={s.value ? `/admin/commandes?status=${s.value}${q ? `&q=${q}` : ''}` : `/admin/commandes${q ? `?q=${q}` : ''}`}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-muted-foreground border hover:bg-muted hover:text-foreground'
              }`}
            >
              {s.label}
            </Link>
          )
        })}
      </div>

      {/* Search */}
      <form method="GET" className="mb-5">
        <input type="hidden" name="status" value={status ?? ''} />
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher par nom, email, téléphone, ID…"
            className="w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </form>

      {/* Orders list */}
      <div className="space-y-3">
        {list.length > 0 ? (
          list.map((order) => {
            const addr = order.shipping_address
            const clientName = addr?.full_name ?? addr?.email ?? order.guest_email ?? 'Client invité'
            const clientPhone = addr?.phone ?? null
            const clientEmail = addr?.email ?? order.guest_email ?? null
            const isGuest = !order.user_id
            return (
              <Link
                key={order.id}
                href={`/admin/commandes/${order.id}`}
                className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                {/* Order # */}
                <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">
                  #{order.id.slice(0, 4).toUpperCase()}
                </div>

                {/* Client info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-sm">{clientName}</p>
                    {isGuest && (
                      <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">invité</span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {clientPhone && <span>{clientPhone}</span>}
                    {clientEmail && <span>{clientEmail}</span>}
                    <span>
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="shrink-0 text-right">
                  <p className="font-bold text-sm">{formatFCFA(order.total)}</p>
                </div>

                {/* Status */}
                <div className="shrink-0">
                  <OrderStatusBadge status={order.status as OrderStatus} />
                </div>
              </Link>
            )
          })
        ) : (
          <div className="rounded-xl border bg-white py-16 text-center text-muted-foreground shadow-sm">
            <p className="text-lg font-medium">Aucune commande trouvée</p>
            <p className="mt-1 text-sm">Essayez de modifier vos filtres.</p>
          </div>
        )}
      </div>
    </div>
  )
}
