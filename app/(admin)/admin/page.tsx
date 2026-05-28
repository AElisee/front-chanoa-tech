import type { Metadata } from 'next'
import { Package, ShoppingBag, Users, AlertTriangle, TrendingUp, Clock, ArrowUpRight } from 'lucide-react'
import { OrderStatusBadge } from '@/components/store/OrderStatusBadge'
import type { OrderStatus } from '@/lib/supabase/types'
import Link from 'next/link'
import { guardAdmin } from '@/lib/supabase/server'
import { formatFCFA } from '@/lib/utils/format'

export const metadata: Metadata = { title: 'Dashboard Admin' }

export default async function AdminDashboardPage() {
  const supabase = await guardAdmin()

  const [
    { count: totalProducts },
    { count: pendingOrders },
    { count: totalClients },
    { data: revenueRows },
    { data: recentOrders },
    { data: lowStockProducts },
    { data: weekOrders },
  ] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user'),
    // Revenue: sum all non-cancelled orders
    supabase.from('orders').select('total').neq('status', 'cancelled'),
    supabase
      .from('orders')
      .select('id, status, total, created_at, shipping_address, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('products')
      .select('id, name, stock')
      .lte('stock', 5)
      .eq('is_active', true)
      .order('stock', { ascending: true })
      .limit(10),
    // Orders last 7 days for mini chart
    supabase
      .from('orders')
      .select('created_at, total')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .neq('status', 'cancelled'),
  ])

  const totalRevenue = (revenueRows ?? []).reduce((s, o) => s + Number(o.total), 0)

  // Build daily revenue for last 7 days
  const dayMap: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dayMap[d.toISOString().slice(0, 10)] = 0
  }
  for (const o of weekOrders ?? []) {
    const day = o.created_at.slice(0, 10)
    if (day in dayMap) dayMap[day] = (dayMap[day] ?? 0) + Number(o.total)
  }
  const weekData = Object.entries(dayMap).map(([date, total]) => ({
    label: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
    total,
  }))
  const maxWeek = Math.max(...weekData.map((d) => d.total), 1)

  const kpis = [
    { label: 'CA total', value: formatFCFA(totalRevenue), icon: TrendingUp, href: '/admin/commandes',
      gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', iconBg: 'bg-emerald-500' },
    { label: 'Produits actifs', value: String(totalProducts ?? 0), icon: Package, href: '/admin/produits',
      gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', iconBg: 'bg-blue-500' },
    { label: 'En attente', value: String(pendingOrders ?? 0), icon: Clock, href: '/admin/commandes?status=pending',
      gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', iconBg: 'bg-amber-500' },
    { label: 'Clients', value: String(totalClients ?? 0), icon: Users, href: '/admin/clients',
      gradient: 'from-purple-500 to-pink-600', bg: 'bg-purple-50', iconBg: 'bg-purple-500' },
    { label: 'Commandes 7j', value: String(weekOrders?.length ?? 0), icon: ShoppingBag, href: '/admin/commandes',
      gradient: 'from-rose-500 to-red-600', bg: 'bg-rose-50', iconBg: 'bg-rose-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue d&apos;ensemble de votre activité — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {kpis.map(({ label, value, icon: Icon, href, bg, iconBg }) => (
          <Link key={label} href={href} className="group">
            <div className={`relative overflow-hidden rounded-2xl border border-transparent ${bg} p-5 transition-all hover:shadow-lg hover:scale-[1.02] hover:border-white`}>
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} text-white shadow-md`}>
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Revenus</h2>
            <p className="text-xs text-muted-foreground">7 derniers jours</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-muted-foreground">FCFA</span>
          </div>
        </div>
        <div className="flex h-32 items-end gap-2">
          {weekData.map((d) => {
            const height = Math.round((d.total / maxWeek) * 100)
            return (
              <div key={d.label} className="group flex flex-1 flex-col items-center gap-1.5">
                <div className="relative w-full">
                  <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">
                    {formatFCFA(d.total)}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-linear-to-t from-emerald-400 to-emerald-500 transition-all hover:from-emerald-500 hover:to-emerald-600"
                    style={{ height: `${Math.max(height, 2)}%`, minHeight: '4px' }}
                  />
                </div>
                <span className="w-full truncate text-center text-[10px] font-medium text-muted-foreground">
                  {d.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-base font-semibold">Dernières commandes</h2>
            </div>
            <Link href="/admin/commandes" className="text-xs font-medium text-primary hover:underline">
              Voir tout →
            </Link>
          </div>
          {!recentOrders || recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Aucune commande.</p>
          ) : (
            <div className="space-y-1">
              {recentOrders.map((order) => {
                const profile = order.profiles as unknown as { full_name: string | null; email: string } | null
                const addr = order.shipping_address as { full_name?: string; email?: string } | null
                const clientName = profile?.full_name ?? profile?.email ?? addr?.full_name ?? addr?.email ?? 'Client'
                return (
                  <Link
                    key={order.id}
                    href={`/admin/commandes/${order.id}`}
                    className="flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-primary">#{order.id.slice(0, 6).toUpperCase()}</span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{clientName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">{formatFCFA(order.total)}</span>
                      <OrderStatusBadge status={order.status as OrderStatus} />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
              <h2 className="text-base font-semibold">Stock faible</h2>
            </div>
            <Link href="/admin/produits" className="text-xs font-medium text-primary hover:underline">
              Gérer →
            </Link>
          </div>
          {!lowStockProducts || lowStockProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Tout le stock est OK.</p>
          ) : (
            <div className="space-y-1">
              {lowStockProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/produits/${p.id}`}
                  className="flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-muted/50"
                >
                  <span className="line-clamp-1 flex-1 text-sm font-medium">{p.name}</span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    p.stock === 0
                      ? 'bg-red-100 text-red-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {p.stock === 0 ? 'Épuisé' : `${p.stock} restant${p.stock > 1 ? 's' : ''}`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
