import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import { formatFCFA } from '@/lib/utils/format'
import { OrderStatusBadge } from '@/components/store/OrderStatusBadge'
import type { OrderStatus } from '@/lib/api/orders'
import { cookies } from 'next/headers'
import { apiClient } from '@/lib/api/client'
import type { UserDto } from '@/lib/api/users'
import type { OrderDto, OrderListResponse } from '@/lib/api/orders'

export const metadata: Metadata = { title: 'Profil client — Admin' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminClientDetailPage({ params }: Props) {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

  const { id } = await params

  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  // Charger le profil client
  let profile: UserDto | null = null
  try {
    const res = await apiClient.get<UserDto>(`/user/${id}`, { headers })
    profile = res.data
  } catch {
    // silencieux
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-muted-foreground">Client introuvable.</p>
        <Link href="/admin/clients" className="text-sm text-primary hover:underline">← Retour</Link>
      </div>
    )
  }

  // Charger les commandes de ce client
  let orderList: OrderDto[] = []
  try {
    const res = await apiClient.get<OrderListResponse>('/orders', {
      params: { userId: id, limit: 200 },
      headers,
    })
    const allOrders = res.data?.data ?? []
    // Filtrer côté client si le backend ne supporte pas le param userId
    const seen = new Set<string>()
    for (const o of allOrders) {
      if (!seen.has(o.id) && o.user_id === id) {
        seen.add(o.id)
        orderList.push(o)
      }
    }
    orderList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } catch {
    // silencieux
  }

  const totalSpent = orderList.reduce((s, o) => s + Number(o.total), 0)

  // Calculer le nombre d'articles par commande depuis order_items inclus dans la réponse
  const itemCounts = new Map<string, number>()
  for (const o of orderList) {
    const n = o.order_items?.length ?? 0
    if (n > 0) itemCounts.set(o.id, n)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/clients" className="rounded-md border p-1.5 hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold">{profile.name ?? profile.email}</h1>
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
              {profile.name && (
                <p className="font-medium text-base">{profile.name}</p>
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
                Inscrit le {new Date(profile.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
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
