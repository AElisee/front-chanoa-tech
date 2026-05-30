import ProductCard from '@/components/store/ProductCard'
import CategoryFilter from '@/components/store/CategoryFilter'
import { SearchBar } from '@/components/store/SearchBar'
import SortSelect from '@/components/store/SortSelect'
import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { apiClient } from '@/lib/api/client'
import type { ProductListResponse, ProductDto } from '@/lib/api/products'
import type { CategoryListResponse, CategoryDto } from '@/lib/api/categories'

export const metadata: Metadata = {
  title: 'Boutique — Chanoa Tech',
  description: 'Découvrez notre catalogue de 2000 références IT professionnelles.',
}

interface Props {
  searchParams: Promise<{
    categorie?: string
    q?: string
    tri?: string
    page?: string
    marque?: string
  }>
}

const PAGE_SIZE = 12

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default async function BoutiquePage({ searchParams }: Props) {
  const params = await searchParams
  const { categorie, q, tri = 'recent', page = '1', marque } = params
  const currentPage = Number(page)

  const headers = await getAuthHeaders()

  // ── Charger toutes les catégories actives (principales + sous) ───
  let allCategories: CategoryDto[] = []
  try {
    const res = await apiClient.get<CategoryListResponse>('/categorie', {
      params: { limit: 200 },
      headers,
    })
    allCategories = (res.data.data ?? []).filter((c) => c.is_active)
  } catch {
    // silencieux : la sidebar s'affichera sans catégories
  }

  // ── Résoudre le filtre catégorie : slug → id ─────────────────────
  let categoryId: string | undefined
  if (categorie) {
    const matched = allCategories.find((c) => c.slug === categorie)
    if (matched) categoryId = matched.id
  }

  // ── Charger les produits ─────────────────────────────────────────
  let products: ProductDto[] = []
  let total = 0
  try {
    const apiParams: Record<string, string | number> = {
      page: currentPage,
      limit: PAGE_SIZE,
    }
    if (q?.trim()) apiParams.search = q.trim()
    if (categoryId) apiParams.categoryId = categoryId

    const res = await apiClient.get<ProductListResponse>('/produits', {
      params: apiParams,
      headers,
    })
    products = res.data.data ?? []
    total = res.data.total ?? 0
  } catch {
    // silencieux
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // ── Marques uniques depuis les produits chargés ──────────────────
  const brands = [
    ...new Set(products.map((p) => p.brand).filter((b): b is string => Boolean(b))),
  ].sort()

  // Filtrage client par marque (l'API ne filtre pas par brand)
  const filteredProducts = marque
    ? products.filter((p) => p.brand?.toLowerCase() === marque.toLowerCase())
    : products

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {categorie
            ? (allCategories.find((c) => c.slug === categorie)?.name ?? 'Boutique')
            : 'Boutique'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} produit{total > 1 ? 's' : ''} disponible{total > 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* ── Sidebar ───────────────────────────────────────────── */}
        <aside className="w-full shrink-0 space-y-4 lg:w-64">
          <CategoryFilter categories={allCategories} current={categorie} />

          {/* Brand filter */}
          {brands.length > 0 && (
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Marques
              </h2>
              <ul className="space-y-1">
                {brands.map((b) => (
                  <li key={b}>
                    <Link
                      href={`?${new URLSearchParams({ ...(categorie ? { categorie } : {}), ...(q ? { q } : {}), marque: marque === b ? '' : b }).toString()}`}
                      className={`block rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted ${
                        marque === b ? 'bg-primary/10 font-medium text-primary' : 'text-foreground'
                      }`}
                    >
                      {b}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* ── Products ──────────────────────────────────────────── */}
        <div className="flex-1">
          {/* Search + sort bar */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchBar defaultValue={q} />
            <SortSelect value={tri} />
          </div>

          {/* Grid */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-lg font-medium text-muted-foreground">Aucun produit trouvé.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Modifiez vos filtres ou votre recherche.
              </p>
              <Link href="/boutique" className="mt-4 text-sm font-medium text-primary hover:underline">
                Voir tous les produits
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product as never} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex flex-wrap justify-center gap-2">
                  {currentPage > 1 && (
                    <a
                      href={`?${new URLSearchParams({ ...params, page: String(currentPage - 1) })}`}
                      className="flex h-9 items-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      ← Précédent
                    </a>
                  )}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = i + 1
                    return (
                      <a
                        key={p}
                        href={`?${new URLSearchParams({ ...params, page: String(p) })}`}
                        className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                          p === currentPage
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {p}
                      </a>
                    )
                  })}
                  {totalPages > 7 && <span className="flex h-9 items-center px-2 text-muted-foreground">…</span>}
                  {currentPage < totalPages && (
                    <a
                      href={`?${new URLSearchParams({ ...params, page: String(currentPage + 1) })}`}
                      className="flex h-9 items-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      Suivant →
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
