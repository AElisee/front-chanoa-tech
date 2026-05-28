import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Package, ChevronRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react'
import ProductCard from '@/components/store/ProductCard'
import ProductDetailClient from '@/components/store/ProductDetailClient'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('name, description, brand, images')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!data) return { title: 'Produit introuvable' }
  const desc = data.description?.slice(0, 160) ?? `${data.brand ?? ''} ${data.name} disponible chez Chanoa Tech.`
  return {
    title: `${data.name} — Chanoa Tech`,
    description: desc,
    openGraph: {
      title: data.name,
      description: desc,
      ...(data.images?.[0] && { images: [{ url: data.images[0] }] }),
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // ── Load product ─────────────────────────────────────────────────
  const { data: product } = await supabase
    .from('products')
    .select(`
      id, name, slug, description, price, price_eur, compare_price,
      stock, images, brand, model, sku, is_active,
      category_id,
      categories(id, name, slug, parent_id)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  // ── Load variants ────────────────────────────────────────────────
  const { data: variantsRaw } = await supabase
    .from('product_variants')
    .select('id, sku, options, price, price_eur, compare_price, stock')
    .eq('product_id', product.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const variants = (variantsRaw ?? []) as {
    id: string
    sku: string | null
    options: Record<string, string>
    price: number
    price_eur: number | null
    compare_price: number | null
    stock: number
  }[]

  // ── Load related products ────────────────────────────────────────
  const { data: related } = await supabase
    .from('products')
    .select('id, name, slug, price, price_eur, compare_price, stock, images, brand, model, categories(name, slug)')
    .eq('category_id', product.category_id)
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(8)

  // ── Category breadcrumb ──────────────────────────────────────────
  const cat = product.categories as unknown as { id: string; name: string; slug: string; parent_id: string | null } | null
  let parentCat: { name: string; slug: string } | null = null
  if (cat?.parent_id) {
    const { data: p } = await supabase
      .from('categories')
      .select('name, slug')
      .eq('id', cat.parent_id)
      .single()
    parentCat = p
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
            <ProductDetailClient product={product} variants={variants} />
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
      {related && related.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Produits similaires</h2>
            <Link href={`/boutique?categorie=${parentCat?.slug ?? cat?.slug ?? ''}`} className="text-sm font-medium text-primary hover:underline">
              Voir tous →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
