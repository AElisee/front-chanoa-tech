'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Settings,
  ExternalLink,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { clearAccessToken } from '@/lib/api/client'
import { useAuth } from '@/lib/hooks/useAuth'

const links = [
  { href: '/admin',             label: 'Dashboard',   icon: LayoutDashboard, exact: true },
  { href: '/admin/commandes',   label: 'Commandes',   icon: ShoppingBag },
  { href: '/admin/produits',    label: 'Produits',    icon: Package },
  { href: '/admin/categories',  label: 'Catégories',  icon: Tag },
  { href: '/admin/clients',     label: 'Clients',     icon: Users },
  { href: '/admin/parametres',  label: 'Paramètres',  icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    // 1. Invalider la session NestJS + effacer cookies httpOnly
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch { /* ignorer si réseau down */ }

    // 2. Nettoyer token en mémoire, cookie non-httpOnly, store Zustand
    clearAccessToken()
    document.cookie = 'access_token=; path=/; max-age=0'
    useAuth.setState({ user: null, initialized: false })

    router.push('/auth/login')
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-linear-to-b from-[#0F3460] via-[#0D2B52] to-[#081B3C] text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-white/5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-[#E94560] to-[#C73651] shadow-lg shadow-[#E94560]/30">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">Chanoa</p>
          <p className="text-[10px] leading-tight text-blue-200/70">Administration</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-3">
        <p className="mb-2 px-3 pt-2 text-[10px] font-semibold uppercase tracking-wider text-blue-300/50">
          Menu
        </p>
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#E94560]" />
              )}
              <Icon className={cn('h-4 w-4 transition-transform group-hover:scale-110', active && 'text-[#E94560]')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-1 border-t border-white/5 p-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-blue-200/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Voir la boutique
        </Link>
        <button
          onClick={handleLogout}
          aria-label="Se déconnecter"
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut className="h-3.5 w-3.5" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
