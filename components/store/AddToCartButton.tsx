'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Minus, Plus, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  slug: string
  stock: number
}

export default function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1)
  const { addItem } = useCart()
  const router = useRouter()
  const outOfStock = product.stock === 0

  function handleAddToCart() {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] ?? null,
        slug: product.slug,
      })
    }
    toast.success(`${qty}× ${product.name} ajouté${qty > 1 ? 's' : ''} au panier`)
  }

  function handleBuyNow() {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] ?? null,
        slug: product.slug,
      })
    }
    router.push('/checkout')
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Quantité :</span>
        <div className="flex items-center rounded-md border bg-card">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            aria-label="Diminuer"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center text-sm font-semibold">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            disabled={qty >= product.stock}
            className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            aria-label="Augmenter"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={handleAddToCart}
          disabled={outOfStock}
          variant="outline"
          className="flex-1 gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          size="lg"
        >
          <ShoppingCart className="h-5 w-5" />
          {outOfStock ? 'Épuisé' : 'Ajouter au panier'}
        </Button>

        <Button
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex-1 gap-2 bg-action text-action-foreground hover:bg-action/90"
          size="lg"
        >
          <Zap className="h-5 w-5" />
          Acheter maintenant
        </Button>
      </div>
    </div>
  )
}
