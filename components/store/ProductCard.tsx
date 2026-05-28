'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/hooks/useCart'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { formatPrice, discountPercent } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  slug: string
  price: number          // FCFA
  price_eur?: number | null
  compare_price?: number | null
  stock: number
  images: string[]
  brand?: string | null
  model?: string | null
  categories?: { name: string; slug: string } | null
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { currency } = useCurrency()

  const image = product.images?.[0] ?? null
  const outOfStock = product.stock === 0
  const lowStock = product.stock > 0 && product.stock <= 5

  // Discount badge — compare_price is also stored in FCFA
  const hasDiscount =
    product.compare_price != null && product.compare_price > product.price
  const discount = hasDiscount
    ? discountPercent(product.price, product.compare_price!)
    : 0

  function handleAddToCart() {
    if (outOfStock) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image,
      slug: product.slug,
    })
    toast.success(`${product.name} ajouté au panier`)
  }

  return (
    <div className="group flex flex-col rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      {/* ── Image ──────────────────────────────────────────── */}
      <Link href={`/boutique/${product.slug}`} className="block overflow-hidden rounded-t-xl">
        <div className="relative aspect-4/3 bg-muted">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <Package className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Discount badge */}
          {hasDiscount && discount > 0 && (
            <span className="absolute left-2.5 top-2.5 rounded-md bg-action px-2 py-0.5 text-xs font-bold text-action-foreground">
              −{discount}%
            </span>
          )}

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center rounded-t-xl bg-black/40">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-foreground">
                Épuisé
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* ── Info ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category */}
        {product.categories && (
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {product.categories.name}
          </p>
        )}

        {/* Name */}
        <Link
          href={`/boutique/${product.slug}`}
          className="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>

        {/* Brand + model specs line */}
        {(product.brand || product.model) && (
          <p className="mb-3 truncate text-xs text-muted-foreground">
            {[product.brand, product.model].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* Price block */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-action">
              {formatPrice(product.price, currency, product.price_eur)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compare_price!, currency)}
              </span>
            )}
          </div>

          {/* Stock indicator */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className={cn(
              'h-2 w-2 rounded-full shrink-0',
              outOfStock ? 'bg-destructive' :
              lowStock   ? 'bg-warning' :
                           'bg-success'
            )} />
            <span className={cn(
              'text-xs font-medium',
              outOfStock ? 'text-destructive' :
              lowStock   ? 'text-amber-600' :
                           'text-green-700'
            )}>
              {outOfStock
                ? 'Épuisé'
                : lowStock
                  ? `Plus que ${product.stock} en stock`
                  : 'En stock'}
            </span>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="mt-3 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          size="sm"
        >
          <ShoppingCart className="h-4 w-4" />
          {outOfStock ? 'Épuisé' : 'Ajouter au panier'}
        </Button>
      </div>
    </div>
  )
}
