'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, Package, ShoppingBag } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/hooks/useCart'
import { formatFCFA } from '@/lib/utils/format'

export default function PanierPage() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart()

  if (itemCount === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/40" />
        <h1 className="text-2xl font-bold">Votre panier est vide</h1>
        <p className="text-muted-foreground">
          Découvrez notre catalogue et ajoutez des produits.
        </p>
        <Link href="/boutique" className={buttonVariants()}>
          Voir la boutique
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold">
        Panier ({itemCount} article{itemCount > 1 ? 's' : ''})
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.id}_${item.variantId ?? 'base'}`}
              className="flex gap-4 rounded-xl border bg-white p-4 shadow-sm"
            >
              {/* Image */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-1">
                <Link
                  href={`/boutique/${item.slug}`}
                  className="text-sm font-semibold leading-snug hover:text-primary"
                >
                  {item.name}
                </Link>
                {item.variantLabel && (
                  <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                )}
                <p className="text-sm font-bold text-primary">
                  {formatFCFA(item.price)} / unité
                </p>

                <div className="mt-auto flex items-center justify-between">
                  {/* Qty */}
                  <div className="flex items-center rounded-md border">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId)}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">
                      {formatFCFA(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id, item.variantId)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Récapitulatif</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{formatFCFA(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Livraison</span>
              <span className="text-muted-foreground">Calculée au checkout</span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">{formatFCFA(total)}</span>
          </div>
          <Link
            href="/checkout"
            className={buttonVariants({ size: 'lg' }) + ' mt-4 w-full'}
          >
            Passer la commande
          </Link>
          <Link
            href="/boutique"
            className={buttonVariants({ variant: 'outline' }) + ' mt-2 w-full'}
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  )
}
