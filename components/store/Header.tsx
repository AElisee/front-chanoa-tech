'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  ShoppingCart, User, Menu, Laptop,
  Search, Monitor, Printer, Server,
  HardDrive, Wifi, Headphones, Tv, Computer,
  Building2, GraduationCap, Landmark, Shield, Award,
  Database, Package, ChevronDown, Phone,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/lib/hooks/useCart'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const categories = [
  { href: '/boutique?categorie=pc-de-bureau',          label: 'PC de bureau',          icon: Computer },
  { href: '/boutique?categorie=ordinateurs-portables', label: 'Ordinateurs portables',  icon: Laptop },
  { href: '/boutique?categorie=ecrans',                label: 'Écrans',                 icon: Monitor },
  { href: '/boutique?categorie=imprimantes',           label: 'Imprimantes',            icon: Printer },
  { href: '/boutique?categorie=serveurs',              label: 'Serveurs',               icon: Server },
  { href: '/boutique?categorie=stockage',              label: 'Stockage',               icon: HardDrive },
  { href: '/boutique?categorie=reseau',                label: 'Réseau',                 icon: Wifi },
  { href: '/boutique?categorie=visioconference',       label: 'Visioconférence',        icon: Tv },
  { href: '/boutique?categorie=accessoires',           label: 'Accessoires',            icon: Headphones },
]

const solutions = [
  { href: '/entreprises',            label: 'Entreprises',       icon: Building2,    desc: 'Postes, réseau, visio, sécurité' },
  { href: '/ecoles',                 label: 'Écoles',            icon: GraduationCap, desc: 'Salles info, WiFi, écrans' },
  { href: '/etat',                   label: 'État & Institutions', icon: Landmark,   desc: 'Ministères, collectivités' },
  { href: '/datacenter',             label: 'Datacenter',        icon: Database,     desc: 'Serveurs, virtualisation, backup' },
  { href: '/packs',                  label: 'Packs entreprise',  icon: Package,      desc: 'Solutions clés-en-main' },
  { href: '/securite',               label: 'Sécurité',          icon: Shield,       desc: 'Vidéosurveillance, contrôle accès' },
  { href: '/references',             label: 'Références',        icon: Award,        desc: 'Cas clients & témoignages' },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { itemCount } = useCart()
  const { currency, toggle } = useCurrency()
  const [searchQuery, setSearchQuery] = useState('')
  const [catOpen, setCatOpen] = useState(false)
  const [solOpen, setSolOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const catRef = useRef<HTMLDivElement>(null)
  const solRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false)
      if (solRef.current && !solRef.current.contains(e.target as Node)) setSolOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Detect admin role
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => { if (data?.role === 'admin') setIsAdmin(true) })
    })
  }, [pathname])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/boutique?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="bg-header-top text-white/75 text-xs">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 sm:px-6">
          <span className="hidden sm:flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            07 55 77 44 55
          </span>
          <span className="font-medium text-white/90">
            Livraison dans toute l'Afrique de l'Ouest · Devis en 24h
          </span>
          <button
            onClick={toggle}
            className="flex items-center gap-1.5 rounded px-2 py-0.5 transition-colors hover:bg-white/10 font-medium text-white/90"
            aria-label="Changer de devise"
          >
            <span className={cn(
              'rounded px-1.5 py-0.5 text-xs font-bold transition-all',
              currency === 'FCFA' ? 'bg-action text-action-foreground' : 'text-white/60'
            )}>FCFA</span>
            <span className="text-white/40">/</span>
            <span className={cn(
              'rounded px-1.5 py-0.5 text-xs font-bold transition-all',
              currency === 'EUR' ? 'bg-action text-action-foreground' : 'text-white/60'
            )}>EUR</span>
          </button>
        </div>
      </div>

      {/* ── Main header ─────────────────────────────────────────── */}
      <div className="bg-header text-header-foreground">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center">
            <Image src="/assets/logos/chanotech.jpeg" alt="Chanoa Tech" width={180} height={54} className="h-14 w-auto object-contain" />
          </Link>

          {/* ── Desktop nav ──────────────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-1 ml-2">
            {/* Catégories dropdown */}
            <div ref={catRef} className="relative">
              <button
                onClick={() => { setCatOpen(v => !v); setSolOpen(false) }}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  catOpen ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                )}
              >
                <Menu className="h-4 w-4" />
                Catégories
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', catOpen && 'rotate-180')} />
              </button>
              {catOpen && (
                <div className="absolute left-0 top-full mt-1 w-64 rounded-lg border bg-card shadow-xl">
                  <div className="p-2">
                    {categories.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setCatOpen(false)}
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        {label}
                      </Link>
                    ))}
                    <div className="mt-1 border-t pt-1">
                      <Link
                        href="/boutique"
                        onClick={() => setCatOpen(false)}
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-muted"
                      >
                        Voir tous les produits →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Solutions dropdown */}
            <div ref={solRef} className="relative">
              <button
                onClick={() => { setSolOpen(v => !v); setCatOpen(false) }}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  solOpen || solutions.some(s => pathname.startsWith(s.href))
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )}
              >
                Solutions
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', solOpen && 'rotate-180')} />
              </button>
              {solOpen && (
                <div className="absolute left-0 top-full mt-1 w-72 rounded-lg border bg-card shadow-xl">
                  <div className="p-2">
                    {solutions.map(({ href, label, icon: Icon, desc }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setSolOpen(false)}
                        className="flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted group"
                      >
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground group-hover:text-primary">{label}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                      </Link>
                    ))}
                    <div className="mt-1 border-t pt-1">
                      <Link
                        href="/contact-grands-comptes"
                        onClick={() => setSolOpen(false)}
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-action transition-colors hover:bg-muted"
                      >
                        Parler à un expert IT →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Boutique */}
            <Link
              href="/boutique"
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                pathname.startsWith('/boutique')
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              )}
            >
              Boutique
            </Link>
          </nav>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden sm:block ml-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit, une marque..."
                className="h-9 w-full rounded-md border border-white/20 bg-white/10 pl-9 pr-4 text-sm text-white placeholder:text-white/50 outline-none transition-all focus:border-action focus:bg-white/15 focus:ring-1 focus:ring-action"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/boutique"
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'sm:hidden text-white hover:bg-white/10 hover:text-white')}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Rechercher</span>
            </Link>

            {/* Devis CTA — desktop */}
            <Link
              href="/contact-grands-comptes"
              className="hidden xl:inline-flex items-center rounded-md border border-action/50 bg-action/10 px-3 py-1.5 text-xs font-semibold text-action transition-colors hover:bg-action hover:text-action-foreground"
            >
              Devis en 24h
            </Link>

            {/* Cart */}
            <Link
              href="/panier"
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'relative text-white hover:bg-white/10 hover:text-white')}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-action text-[10px] font-bold text-action-foreground">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
              <span className="sr-only">Panier ({itemCount})</span>
            </Link>

            {/* Admin link — visible only for admins */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-500/30 hover:text-white"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}

            {/* Account */}
            <Link
              href="/compte"
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'text-white hover:bg-white/10 hover:text-white')}
            >
              <User className="h-5 w-5" />
              <span className="sr-only">Mon compte</span>
            </Link>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger id="mobile-menu-trigger">
                <span className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'lg:hidden text-white hover:bg-white/10 hover:text-white')}>
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </span>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="bg-header px-4 py-4">
                  <div className="flex items-center">
                    <Image src="/assets/logos/chanotech.jpeg" alt="Chanoa Tech" width={160} height={48} className="h-12 w-auto object-contain" />
                  </div>
                </div>

                <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false) }} className="border-b p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Rechercher..."
                      className="h-9 w-full rounded-md border bg-muted pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </form>

                <nav className="overflow-y-auto p-3">
                  <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Catégories
                  </p>
                  {categories.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-md px-2 py-2.5 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {label}
                    </Link>
                  ))}

                  <div className="my-3 border-t" />

                  <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Solutions
                  </p>
                  {solutions.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-md px-2 py-2.5 text-sm text-foreground transition-colors hover:bg-muted hover:text-primary"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {label}
                    </Link>
                  ))}

                  <div className="my-3 border-t" />

                  <Link
                    href="/contact-grands-comptes"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-md bg-action/10 px-2 py-2.5 text-sm font-semibold text-action transition-colors hover:bg-action/20"
                  >
                    Devis en 24h →
                  </Link>

                  <div className="my-3 border-t" />

                  <Link
                    href="/compte"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-md px-2 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Mon compte
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-md bg-amber-50 px-2 py-2.5 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                    >
                      <Shield className="h-4 w-4" />
                      Administration
                    </Link>
                  )}

                  <div className="my-3 border-t" />

                  <div className="px-2">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Devise
                    </p>
                    <div className="flex gap-2">
                      {(['FCFA', 'EUR'] as const).map((c) => (
                        <button
                          key={c}
                          onClick={() => useCurrency.getState().setCurrency(c)}
                          className={cn(
                            'flex-1 rounded-md border py-2 text-sm font-medium transition-colors',
                            currency === c
                              ? 'border-action bg-action text-action-foreground'
                              : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
