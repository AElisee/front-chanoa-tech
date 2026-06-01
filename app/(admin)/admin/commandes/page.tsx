import Link from 'next/link'
import type { Metadata } from 'next'
import { Search, Banknote, CreditCard } from 'lucide-react'
import { OrderStatusBadge } from '@/components/store/OrderStatusBadge'
import type { OrderStatus } from '@/lib/api/orders'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import { formatFCFA } from '@/lib/utils/format'
import { cookies } from 'next/headers'
import { apiClient } from '@/lib/api/client'
import Pagination from '@/components/ui/Pagination'
import type { OrderListResponse, OrderDto } from '@/lib/api/orders'

export const metadata: Metadata = { title: 'Commandes — Admin' }

const PAGE_SIZE = 25

const STATUSES: { value: string; label: string }[] = [
  { value: '', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'processing', label: 'En préparation' },
  { value: 'shipped', label: 'Expédié' },
  { value: 'delivered', label: 'Livré' },
  { value: 'cancelled', label: 'Annulé' },
]

const PAYMENT_MODES: { value: string; label: string }[] = [
  { value: '', label: 'Tous modes' },
  { value: 'cash_on_delivery', label: '💵 Livraison' },
  { value: 'genius_pay', label: '💳 GeniusPay' },
]

interface Props {
  searchParams: Promise<{ status?: string; q?: string; page?: string; updated?: string; payment?: string }>
}

export default async function AdminCommandesPage({ searchParams }: Props) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

  const { status, q, page = '1', updated, payment } = await searchParams
  const currentPage = Math.max(1, Number(page))

  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  let allOrders: OrderDto[] = []
  let serverTotal = 0
  try {
    const res = await apiClient.get<OrderListResponse>('/commande', {
      params: { limit: 500 },
      headers,
    })
    allOrders = res.data.data ?? []
    serverTotal = res.data.total ?? allOrders.length
  } catch (err: any) {
    console.error('[admin/commandes] fetch error:', err?.response?.status)
  }

  // Filtrage côté serveur
  let filtered = allOrders as any[]
  if (status) {
    filtered = filtered.filter((o) => o.status === status)
  }
  if (payment) {
    filtered = filtered.filter((o) => {
      const pm = o.paymentMethod ?? o.payment_method ?? ''
      return pm === payment
    })
  }
  if (q?.trim()) {
    const lower = q.toLowerCase()
    filtered = filtered.filter((o) => {
      const addr = (o.shippingAddress ?? o.shipping_address) as any
      const guest = o.guestEmail ?? o.guest_email ?? ''
      return (
        o.id.toLowerCase().includes(lower) ||
        addr?.full_name?.toLowerCase().includes(lower) ||
        addr?.email?.toLowerCase().includes(lower) ||
        addr?.phone?.includes(lower) ||
        guest.toLowerCase().includes(lower)
      )
    })
  }

  const total = filtered.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const list = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function buildHref(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams()
    const merged = { status, q, payment, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v)
    }
    return `/admin/commandes?${p}`
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Commandes</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {total} résultat{total > 1 ? 's' : ''}
            {serverTotal > 500 && (
              <span className="ml-1 text-amber-600">(affiché sur {serverTotal} total)</span>
            )}
          </p>
        </div>
      </div>

      {updated && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          <span>✓</span>
          Statut de la commande mis à jour avec succès.
        </div>
      )}

      {/* Onglets statut */}
      <div className="mb-3 flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const isActive = (status ?? '') === s.value
          return (
            <a
              key={s.value}
              href={buildHref({ status: s.value || undefined, page: undefined })}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'border bg-white text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {s.label}
            </a>
          )
        })}
      </div>

      {/* Onglets mode de paiement */}
      <div className="mb-4 flex flex-wrap gap-2">
        {PAYMENT_MODES.map((m) => {
          const isActive = (payment ?? '') === m.value
          return (
            <a
              key={m.value}
              href={buildHref({ payment: m.value || undefined, page: undefined })}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'border bg-white text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {m.label}
            </a>
          )
        })}
      </div>

      {/* Recherche */}
      <form method="GET" className="mb-5">
        {status  && <input type="hidden" name="status"  value={status} />}
        {payment && <input type="hidden" name="payment" value={payment} />}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Nom, email, téléphone, ID commande…"
            className="w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </form>

      {/* Liste */}
      <div className="space-y-3">
        {list.length > 0 ? (
          list.map((order: any) => {
            const addr        = order.shippingAddress ?? order.shipping_address
            const guest       = order.guestEmail ?? order.guest_email ?? null
            const clientName  = addr?.full_name ?? addr?.email ?? guest ?? 'Client invité'
            const clientPhone = addr?.phone ?? null
            const clientEmail = addr?.email ?? guest ?? null
            const isGuest     = !(order.userId ?? order.user_id)
            const pm          = order.paymentMethod ?? order.payment_method ?? null
            const isCOD       = pm === 'cash_on_delivery'
            const createdAt   = order.createdAt ?? order.created_at

            return (
              <Link
                key={order.id}
                href={`/admin/commandes/${order.id}`}
                className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary sm:flex">
                  #{order.id.slice(0, 4).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold">{clientName}</p>
                    {isGuest && (
                      <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                        invité
                      </span>
                    )}
                    {/* Badge mode de paiement */}
                    {pm && (
                      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isCOD
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isCOD
                          ? <><Banknote className="h-3 w-3" />Livraison</>
                          : <><CreditCard className="h-3 w-3" />GeniusPay</>
                        }
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {clientPhone && <span>{clientPhone}</span>}
                    {clientEmail && <span>{clientEmail}</span>}
                    {createdAt && (
                      <span>
                        {new Date(createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold">{formatFCFA(order.total)}</p>
                </div>
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        searchParams={{
          ...(status  ? { status }  : {}),
          ...(q       ? { q }       : {}),
          ...(payment ? { payment } : {}),
        }}
        basePath="/admin/commandes"
      />
    </div>
  )
}
