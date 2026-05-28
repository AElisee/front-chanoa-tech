import Link from 'next/link'
import { redirect } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button-variants'
import type { Metadata } from 'next'
import { OrderStatusBadge } from '@/components/store/OrderStatusBadge'
import type { OrderStatus } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/server'
import { formatFCFA } from '@/lib/utils/format'

export const metadata: Metadata = { title: 'Mon compte — Chanoa Tech' }

export default async function ComptePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/compte')

  const [profileRes, ordersRes, roleRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single(),
    supabase
      .from('orders')
      .select('id, status, total, created_at, order_items(id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single(),
  ])
  const profile = profileRes.data as { full_name: string | null; email: string } | null
  const isAdmin = (roleRes.data as { role: string } | null)?.role === 'admin'

  const recentOrders = (ordersRes.data ?? []) as Array<{
    id: string
    status: string
    total: number
    created_at: string
    order_items: Array<{ id: string }>
  }>

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold">Mon compte</h1>
      <p className="mb-8 text-muted-foreground">
        Bonjour, {profile?.full_name ?? profile?.email ?? user.email}
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
            {recentOrders.map((order) => (
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
                    {order.order_items.length} article
                    {order.order_items.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary">
                    {formatFCFA(order.total)}
                  </span>
                  <OrderStatusBadge status={order.status as OrderStatus} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
