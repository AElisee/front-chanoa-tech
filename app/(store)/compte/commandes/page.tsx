import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { OrderStatusBadge } from '@/components/store/OrderStatusBadge'
import { formatFCFA } from '@/lib/utils/format'
import type { OrderStatus } from '@/lib/api/orders'
import { cookies } from 'next/headers'
import { apiClient } from '@/lib/api/client'
import type { OrderListResponse, OrderDto } from '@/lib/api/orders'

export const metadata: Metadata = { title: 'Mes commandes — Chanoa Tech' }

export default async function CommandesPage() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login?redirect=/compte/commandes')

  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  let orders: OrderDto[] = []
  try {
    const res = await apiClient.get<OrderListResponse>('/orders', {
      params: { limit: 100 },
      headers,
    })
    orders = res.data.data ?? []
  } catch {
    // silencieux
  }

  // Tri par date décroissante (l'API renvoie déjà trié, mais par sécurité)
  orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  type OrderItemRow = {
    id: string
    quantity: number
    unit_price: number
    product_snapshot: { name?: string }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">Mes commandes</h1>

      {orders.length === 0 ? (
        <p className="text-muted-foreground">Vous n&apos;avez encore passé aucune commande.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = (order.order_items ?? []) as OrderItemRow[]
            return (
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
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 text-sm">
                      <span>{(item.product_snapshot as { name?: string })?.name ?? 'Produit'} × {item.quantity}</span>
                      <span className="font-medium">
                        {formatFCFA(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
