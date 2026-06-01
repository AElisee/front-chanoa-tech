'use client'

import { deleteProduct } from '@/app/(admin)/admin/produits/[id]/actions'

export default function DeleteProductButton({ productId }: { productId: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        if (!confirm('Supprimer ce produit ? Cette action est irréversible.')) return
        await deleteProduct(productId)
      }}
      className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
    >
      Supprimer ce produit
    </button>
  )
}
