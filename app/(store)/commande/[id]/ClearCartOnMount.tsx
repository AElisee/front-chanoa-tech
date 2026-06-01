'use client'

import { useEffect } from 'react'
import { useCart } from '@/lib/hooks/useCart'

/** Clears the Zustand cart once the confirmation page mounts. */
export default function ClearCartOnMount() {
  const clearCart = useCart((s) => s.clearCart)
  useEffect(() => { clearCart() }, [clearCart])
  return null
}
