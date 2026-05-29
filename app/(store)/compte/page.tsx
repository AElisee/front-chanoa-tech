import Link from 'next/link'
import { redirect } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button-variants'
import type { Metadata } from 'next'
import { OrderStatusBadge } from '@/components/store/OrderStatusBadge'
import type { OrderStatus } from '@/lib/api/orders'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { formatFCFA } from '@/lib/utils/format'
import { cookies } from 'next/headers'
import { apiClient } from '@/lib/api/client'
import type { OrderListResponse } from '@/lib/api/orders'

export const metadata: Metadata = { title: 'Mon compte — Chanoa Tech' }

export default async function ComptePage() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login?redirect=/compte')

  const isAdmin = user.role === 'admin'

  // ── Charger les commandes récentes via l'API ─────────────────────
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  type RecentOrder = {
    id: string
    status: string
    total: number
    created_at: string
    order_items?: Array<{ id: string }>
  }

  let recentOrders: RecentOrder[] = []
  try {
    const res = await apiClient.get<OrderListResponse>('/commande', {
      params: { limit: 5 },
      headers,
    })
    recentOrders = (res.data.data ?? []) as RecentOrder[]
  } catch {
    // silencieux
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold">Mon compte</h1>
      <p className="mb-8 text-muted-foreground">
        Bonjour, {user.email}
      </p>

      {/* Admin banner */}
      {isAdmin && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-amber-900">Vous êtes administrateur</p>
            <p className="text-xs text-amber-700">Accédez au tableau de bord pour gérer le site.</p>
          </div>
          <Link
            href="/admin"
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            Ouvrir le panel admin
          </Link>
        </div>
      )}

      {/* Quick links */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {isAdmin && (
          <Link
            href="/admin"
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-center shadow-sm hover:border-amber-500"
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-sm font-semibold text-amber-800">Administration</span>
          </Link>
        )}
        <Link
          href="/compte/commandes"
          className="flex flex-col items-center gap-2 rounded-xl border bg-white p-4 text-center shadow-sm hover:border-primary"
        >
          <span className="text-2xl">📦</span>
          <span className="text-sm font-medium">Mes commandes</span>
        </Link>
        <Link
          href="/compte/profil"
          className="flex flex-col items-center gap-2 rounded-xl border bg-white p-4 text-center shadow-sm hover:border-primary"
        >
          <span className="text-2xl">👤</span>
          <span className="text-sm font-medium">Mon profil</span>
        </Link>
        <Link
          href="/boutique"
          className="flex flex-col items-center gap-2 rounded-xl border bg-white p-4 text-center shadow-sm hover:border-primary"
        >
          <span className="text-2xl">🛒</span>
          <span className="text-sm font-medium">Boutique</span>
        </Link>
      </div>

      {/* Recent orders */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Commandes récentes</h2>
          <Link
            href="/compte/commandes"
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            Voir tout
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune commande pour l&apos;instant.</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const itemCount = order.order_items?.length ?? 0
              return (
                <Link
                  key={order.id}
                  href="/compte/commandes"
                  className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm hover:border-primary"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Commande #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')} ·{' '}
                      {itemCount} article{itemCount > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary">
                      {formatFCFA(order.total)}
                    </span>
                    <OrderStatusBadge status={order.status as OrderStatus} />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
