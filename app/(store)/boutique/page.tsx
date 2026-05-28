import ProductCard from '@/components/store/ProductCard'
import CategoryFilter from '@/components/store/CategoryFilter'
import { SearchBar } from '@/components/store/SearchBar'
import SortSelect from '@/components/store/SortSelect'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'

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

export default async function BoutiquePage({ searchParams }: Props) {
  const params = await searchParams
  const { categorie, q, tri = 'recent', page = '1', marque } = params
  const offset = (Number(page) - 1) * PAGE_SIZE

  const supabase = await createClient()

  // ── Load main categories (parent_id IS NULL) for filter sidebar ──
  const { data: mainCategories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .is('parent_id', null)
    .eq('is_active', true)
    .order('sort_order')

  // ── Resolve category filter: main cat slug → subcategory ids ──
  let categoryIds: string[] | null = null
  if (categorie) {
    // Find main category
    const { data: mainCat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorie)
      .single()

    if (mainCat) {
      // Get all subcategories of this main category
      const { data: subCats } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', mainCat.id)

      categoryIds = subCats?.length
        ? subCats.map((c) => c.id)
        : [mainCat.id]
    }
  }

  // ── Build product query ──────────────────────────────────────────
  let query = supabase
    .from('products')
    .select(
      'id, name, slug, price, price_eur, compare_price, stock, images, brand, model, categories(name, slug)',
      { count: 'exact' }
    )
    .eq('is_active', true)

  if (categoryIds) {
    query = query.in('category_id', categoryIds)
  }

  if (marque) {
    query = query.ilike('brand', marque)
  }

  if (q?.trim()) {
    // Full-text search on search_vector (French language)
    query = query.textSearch('search_vector', q.trim(), {
      type: 'websearch',
      config: 'french',
    })
  }

  // Sort
  if (tri === 'prix-asc')  query = query.order('price', { ascending: true })
  else if (tri === 'prix-desc') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  // Pagination
  query = query.range(offset, offset + PAGE_SIZE - 1)

  const { data: products, count } = await query

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  // ── Brands for this category (for brand filter) ──────────────────
  let brandsQuery = supabase
    .from('products')
    .select('brand')
    .eq('is_active', true)
    .not('brand', 'is', null)
  if (categoryIds) brandsQuery = brandsQuery.in('category_id', categoryIds)
  const { data: brandRows } = await brandsQuery
  const brands = [...new Set(brandRows?.map((r) => r.brand).filter(Boolean))].sort()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {categorie
            ? (mainCategories?.find((c) => c.slug === categorie)?.name ?? 'Boutique')
            : 'Boutique'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {count ?? 0} produit{(count ?? 0) > 1 ? 's' : ''} disponible{(count ?? 0) > 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* ── Sidebar ───────────────────────────────────────────── */}
        <aside className="w-full shrink-0 space-y-4 lg:w-64">
          <CategoryFilter categories={mainCategories ?? []} current={categorie} />

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
                      href={`?${new URLSearchParams({ ...(categorie ? { categorie } : {}), ...(q ? { q } : {}), marque: marque === b ? '' : b! }).toString()}`}
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
          {!products || products.length === 0 ? (
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
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex flex-wrap justify-center gap-2">
                  {Number(page) > 1 && (
                    <a
                      href={`?${new URLSearchParams({ ...params, page: String(Number(page) - 1) })}`}
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
                          p === Number(page)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {p}
                      </a>
                    )
                  })}
                  {totalPages > 7 && <span className="flex h-9 items-center px-2 text-muted-foreground">…</span>}
                  {Number(page) < totalPages && (
                    <a
                      href={`?${new URLSearchParams({ ...params, page: String(Number(page) + 1) })}`}
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
