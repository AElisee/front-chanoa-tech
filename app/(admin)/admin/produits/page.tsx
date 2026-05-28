import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { buttonVariants } from '@/components/ui/button-variants'
import { Plus, Search, Package, Pencil } from 'lucide-react'
import { guardAdmin } from '@/lib/supabase/server'
import { formatFCFA } from '@/lib/utils/format'

export const metadata: Metadata = { title: 'Produits — Admin' }

interface Props {
  searchParams: Promise<{ q?: string; page?: string; categorie?: string }>
}

const PAGE_SIZE = 20

export default async function AdminProduitsPage({ searchParams }: Props) {
  const params = await searchParams
  const { q, page = '1', categorie } = params
  const offset = (Number(page) - 1) * PAGE_SIZE

  const supabase = await guardAdmin()

  // Load categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .is('parent_id', null)
    .eq('is_active', true)
    .order('sort_order')

  // Build product query (no nested join — service role doesn't handle it well)
  let query = supabase
    .from('products')
    .select(
      'id, name, slug, price, stock, brand, sku, is_active, status, category_id, images',
      { count: 'exact' }
    )

  if (q?.trim()) {
    // Sanitize: strip PostgREST special chars that would enable filter injection
    // Allowed: letters, digits, space, dash, underscore, dot, accents
    const sanitized = q.trim().replace(/[^a-zA-Z0-9\s\-_.À-ÿ]/g, '').slice(0, 100)
    if (sanitized) {
      query = query.or(`name.ilike.%${sanitized}%,brand.ilike.%${sanitized}%,sku.ilike.%${sanitized}%`)
    }
  }

  if (categorie) {
    // Resolve category slug to subcategory ids
    const { data: mainCat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorie)
      .single()
    if (mainCat) {
      const { data: subCats } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', mainCat.id)
      const ids = subCats?.length ? subCats.map((c) => c.id) : [mainCat.id]
      query = query.in('category_id', ids)
    }
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const { data: products, count } = await query

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produits</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{count ?? 0} produits</p>
        </div>
        <Link href="/admin/produits/nouveau" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" /> Nouveau produit
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher nom, marque, SKU…"
            className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          name="categorie"
          defaultValue={categorie ?? ''}
          className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
        >
          <option value="">Toutes catégories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Filtrer
        </button>
        {(q || categorie) && (
          <Link
            href="/admin/produits"
            className="flex h-9 items-center rounded-md border px-4 text-sm text-muted-foreground hover:text-foreground"
          >
            Effacer
          </Link>
        )}
      </form>

      {/* Products grid */}
      {!products || products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-white py-20 text-center shadow-sm">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Package className="h-7 w-7 text-muted-foreground/60" />
          </div>
          <p className="font-medium text-foreground">Aucun produit trouvé</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {q || categorie ? 'Essayez de modifier vos filtres.' : 'Commencez par créer un produit.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const p = product as unknown as {
              id: string; name: string; slug: string; price: number; stock: number;
              brand: string | null; sku: string | null; is_active: boolean; images: string[] | null
            }
            const image = p.images?.[0]
            const stockLabel = p.stock === 0 ? 'Épuisé' : `${p.stock} en stock`
            const stockClass = p.stock === 0
              ? 'bg-red-100 text-red-700'
              : p.stock <= 5
                ? 'bg-orange-100 text-orange-700'
                : 'bg-green-100 text-green-700'
            return (
              <Link
                key={p.id}
                href={`/admin/produits/${p.id}`}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md hover:border-primary/30 ${p.is_active ? '' : 'opacity-60'}`}
              >
                {/* Image */}
                <div className="relative aspect-square bg-muted">
                  {image ? (
                    <Image
                      src={image}
                      alt={p.name}
                      fill
                      className="object-contain p-3"
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  {/* Stock badge — top left */}
                  <span className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${stockClass}`}>
                    {stockLabel}
                  </span>
                  {/* Active status badge — top right */}
                  {!p.is_active && (
                    <span className="absolute right-2 top-2 rounded-full bg-gray-700 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                      Inactif
                    </span>
                  )}
                  {/* Edit hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-md">
                      <Pencil className="h-3.5 w-3.5" />
                      Modifier
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  {p.brand && (
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {p.brand}
                    </p>
                  )}
                  <p className="line-clamp-2 text-sm font-semibold text-foreground">
                    {p.name}
                  </p>
                  {p.sku && (
                    <p className="font-mono text-[10px] text-muted-foreground">{p.sku}</p>
                  )}
                  <p className="mt-auto pt-2 text-base font-bold text-primary">
                    {formatFCFA(p.price)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {Number(page) > 1 && (
            <Link
              href={`?${new URLSearchParams({ ...(q ? { q } : {}), ...(categorie ? { categorie } : {}), page: String(Number(page) - 1) })}`}
              className="flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
            >
              ← Précédent
            </Link>
          )}
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1
            return (
              <Link
                key={p}
                href={`?${new URLSearchParams({ ...(q ? { q } : {}), ...(categorie ? { categorie } : {}), page: String(p) })}`}
                className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                  p === Number(page)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {p}
              </Link>
            )
          })}
          {Number(page) < totalPages && (
            <Link
              href={`?${new URLSearchParams({ ...(q ? { q } : {}), ...(categorie ? { categorie } : {}), page: String(Number(page) + 1) })}`}
              className="flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
            >
              Suivant →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
