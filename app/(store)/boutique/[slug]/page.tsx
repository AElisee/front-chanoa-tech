export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react'
import ProductCard from '@/components/store/ProductCard'
import ProductDetailClient from '@/components/store/ProductDetailClient'
import ImageGallery from '@/components/store/ImageGallery'
import { cookies } from 'next/headers'
import { apiClient } from '@/lib/api/client'
import type { ProductDto, ProductListResponse, VariantDto } from '@/lib/api/products'
import type { CategoryDto } from '@/lib/api/categories'

interface Props {
  params: Promise<{ slug: string }>
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function getProductBySlug(
  slug: string,
  headers: Record<string, string>,
): Promise<ProductDto | null> {
  try {
    const res = await apiClient.get<ProductDto>(`/produits/by-slug/${slug}`, { headers })
    return res.data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const headers = await getAuthHeaders()
  const product = await getProductBySlug(slug, headers)
  if (!product) return { title: 'Produit introuvable' }
  const desc =
    product.description?.slice(0, 160) ??
    `${product.brand ?? ''} ${product.name} disponible chez Chanoa Tech.`
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

  const product = await getProductBySlug(slug, headers)
  if (!product || !product.is_active) notFound()

  // Variantes du produit
  let variants: VariantDto[] = []
  try {
    const res = await apiClient.get<VariantDto[]>(`/produits/${product.id}/variants`, { headers })
    variants = (res.data ?? []).filter((v) => v.is_active).sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))
  } catch {
    // silencieux
  }

  // Utilise categoryId (retourné par le backend) avec fallback sur category_id
  const catId = product.categoryId ?? product.category_id ?? null

  // Produits similaires
  let related: ProductDto[] = []
  if (catId) {
    try {
      const res = await apiClient.get<ProductListResponse>('/produits', {
        params: { categoryId: catId, limit: 9 },
        headers,
      })
      related = (res.data.data ?? []).filter((p) => p.id !== product.id).slice(0, 8)
    } catch {
      // silencieux
    }
  }

  // Catégorie pour le breadcrumb
  let cat: CategoryDto | null = null
  let parentCat: { name: string; slug: string } | null = null
  if (catId) {
    try {
      const res = await apiClient.get<CategoryDto>(`/categorie/${catId}`, { headers })
      cat = res.data
      if (cat.parent_id) {
        const parentRes = await apiClient.get<CategoryDto>(
          `/categorie/${cat.parent_id}`,
          { headers },
        )
        parentCat = { name: parentRes.data.name, slug: parentRes.data.slug }
      }
    } catch {
      // silencieux
    }
  }

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
            <Link
              href={`/boutique?categorie=${cat.slug}`}
              className="hover:text-primary"
            >
              {cat.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* ── Galerie ───────────────────────────────────────────── */}
        <ImageGallery images={product.images ?? []} name={product.name} />

        {/* ── Infos produit ─────────────────────────────────────── */}
        <div className="flex flex-col">
          {/* Catégorie + marque */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {cat && (
              <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {cat.name}
              </span>
            )}
            {product.brand && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
                {product.brand}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {product.name}
          </h1>

          {product.model && (
            <p className="mt-1 text-sm text-muted-foreground">{product.model}</p>
          )}
          {product.sku && (
            <p className="mt-0.5 font-mono text-xs text-muted-foreground/70">
              Réf. {product.sku}
            </p>
          )}

          {/* Partie interactive : prix, variantes, panier */}
          <div className="mt-5">
            <ProductDetailClient product={product as never} variants={variants as never} />
          </div>

          {/* Bande de confiance */}
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
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Produits similaires */}
      {related.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Produits similaires</h2>
            {cat && (
              <a
                href={`/boutique?categorie=${cat.slug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                Voir tous →
              </a>
            )}
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
