import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Package, ChevronRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react'
import ProductCard from '@/components/store/ProductCard'
import ProductDetailClient from '@/components/store/ProductDetailClient'
import { cookies } from 'next/headers'
import { apiClient } from '@/lib/api/client'
import type { ProductDto, ProductListResponse } from '@/lib/api/products'
import type { CategoryDto, CategoryListResponse } from '@/lib/api/categories'

interface Props {
  params: Promise<{ slug: string }>
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function getProductBySlug(slug: string, headers: Record<string, string>): Promise<ProductDto | null> {
  try {
    // Tenter d'abord GET /products/:slug (si l'API accepte le slug comme id)
    const res = await apiClient.get<ProductDto>(`/products/${slug}`, { headers })
    return res.data
  } catch {
    // Fallback : chercher via search
    try {
      const res = await apiClient.get<ProductListResponse>('/products', {
        params: { search: slug, limit: 1 },
        headers,
      })
      const found = res.data.data?.find((p) => p.slug === slug)
      return found ?? null
    } catch {
      return null
    }
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const headers = await getAuthHeaders()
  const product = await getProductBySlug(slug, headers)

  if (!product) return { title: 'Produit introuvable' }
  const desc = product.description?.slice(0, 160) ?? `${product.brand ?? ''} ${product.name} disponible chez Chanoa Tech.`
  return {
    title: `${product.name} — Chanoa Tech`,
    description: desc,
    openGraph: {
      title: product.name,
      description: desc,
      ...(product.images?.[0] && { images: [{ url: product.images[0] }] }),
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const headers = await getAuthHeaders()

  // ── Charger le produit ───────────────────────────────────────────
  const product = await getProductBySlug(slug, headers)
  if (!product || !product.is_active) notFound()

  // ── Charger les produits similaires ─────────────────────────────
  let related: ProductDto[] = []
  if (product.category_id) {
    try {
      const res = await apiClient.get<ProductListResponse>('/products', {
        params: { categoryId: product.category_id, limit: 8 },
        headers,
      })
      related = (res.data.data ?? []).filter((p) => p.id !== product.id).slice(0, 8)
    } catch {
      // silencieux
    }
  }

  // ── Charger la catégorie pour le breadcrumb ──────────────────────
  let cat: CategoryDto | null = null
  let parentCat: { name: string; slug: string } | null = null
  if (product.category_id) {
    try {
      const res = await apiClient.get<CategoryDto>(`/categories/${product.category_id}`, { headers })
      cat = res.data
      if (cat.parent_id) {
        const parentRes = await apiClient.get<CategoryDto>(`/categories/${cat.parent_id}`, { headers })
        parentCat = { name: parentRes.data.name, slug: parentRes.data.slug }
      }
    } catch {
      // silencieux
    }
  }

  // Les variantes sont gérées côté API mais non exposées dans l'endpoint actuel — tableau vide
  const variants: {
    id: string
    sku: string | null
    options: Record<string, string>
    price: number
    price_eur: number | null
    compare_price: number | null
    stock: number
  }[] = []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">Accueil</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/boutique" className="hover:text-primary">Boutique</Link>
        {parentCat && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/boutique?categorie=${parentCat.slug}`} className="hover:text-primary">
              {parentCat.name}
            </Link>
          </>
        )}
        {cat && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/boutique?categorie=${parentCat?.slug ?? cat.slug}`} className="hover:text-primary">
              {cat.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* ── Image gallery ──────────────────────────────────────── */}
        <div>
          <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-muted">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain p-6"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground/20" />
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.images && product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {product.images.slice(0, 5).map((img: string, i: number) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={img}
                    alt={`${product.name} — vue ${i + 1}`}
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Product info ───────────────────────────────────────── */}
        <div className="flex flex-col">
          {/* Category + brand */}
          <div className="mb-2 flex items-center gap-2">
            {cat && (
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {cat.name}
              </span>
            )}
            {cat && product.brand && <span className="text-muted-foreground/40">·</span>}
            {product.brand && (
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {product.brand}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{product.name}</h1>

          {product.model && (
            <p className="mt-1 text-sm text-muted-foreground">{product.model}</p>
          )}

          {/* Interactive: variants + price + add to cart */}
          <div className="mt-5">
            <ProductDetailClient product={product as never} variants={variants} />
          </div>

          {/* Trust strip */}
          <div className="mt-6 grid grid-cols-3 gap-3 rounded-xl border p-4">
            <div className="flex flex-col items-center gap-1 text-center">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Garantie 1 an</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Livraison 48-72h</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <RotateCcw className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Retour 14 jours</span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6 border-t pt-5">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h2>
              <p className="text-sm leading-relaxed text-foreground/80">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Produits similaires</h2>
            <Link href={`/boutique?categorie=${parentCat?.slug ?? cat?.slug ?? ''}`} className="text-sm font-medium text-primary hover:underline">
              Voir tous →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p as never} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
