import ProductCard from '@/components/store/ProductCard'
import CategoryFilter from '@/components/store/CategoryFilter'
import { SearchBar } from '@/components/store/SearchBar'
import SortSelect from '@/components/store/SortSelect'
import Pagination from '@/components/ui/Pagination'
import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { apiClient } from '@/lib/api/client'
import type { ProductListResponse, ProductDto } from '@/lib/api/products'
import type { CategoryListResponse, CategoryDto } from '@/lib/api/categories'

export const dynamic = 'force-dynamic'

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
  } catch (err) {
    console.error('[boutique] categories fetch error:', err)
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
    if (marque?.trim()) apiParams.brand = marque.trim()
    if (tri !== 'recent') apiParams.tri = tri

    const res = await apiClient.get<ProductListResponse>('/produits', {
      params: apiParams,
      headers,
    })
    products = res.data.data ?? []
    total = res.data.total ?? 0
  } catch (err) {
    console.error('[boutique] products fetch error:', err)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // ── Marques globales — appel sans pagination pour que la sidebar
  //    reste cohérente quelle que soit la page courante ───────────────
  let brands: string[] = []
  try {
    const brandsRes = await apiClient.get<ProductListResponse>('/produits', {
      params: {
        limit: 500,
        ...(categoryId ? { categoryId } : {}),
        ...(q?.trim() ? { search: q.trim() } : {}),
      },
      headers,
    })
    brands = [
      ...new Set(
        (brandsRes.data.data ?? [])
          .map((p) => p.brand)
          .filter((b): b is string => Boolean(b)),
      ),
    ].sort()
  } catch {
    // Fallback : marques de la page courante
    brands = [
      ...new Set(products.map((p) => p.brand).filter((b): b is string => Boolean(b))),
    ].sort()
  }

  const filteredProducts = products

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
                      href={`?${new URLSearchParams({ ...(categorie ? { categorie } : {}), ...(q ? { q } : {}), ...(tri !== 'recent' ? { tri } : {}), marque: marque === b ? '' : b }).toString()}`}
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

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/boutique"
                searchParams={{
                  ...(categorie ? { categorie } : {}),
                  ...(q ? { q } : {}),
                  ...(marque ? { marque } : {}),
                  ...(tri !== 'recent' ? { tri } : {}),
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
