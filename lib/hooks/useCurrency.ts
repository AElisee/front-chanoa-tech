'use client'

/**
 * lib/hooks/useCurrency.ts
 * Zustand store for EUR/FCFA currency preference.
 * Persisted to localStorage so the choice survives navigation.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Currency } from '@/lib/utils/format'

interface CurrencyStore {
  currency: Currency
  setCurrency: (c: Currency) => void
  toggle: () => void
}

export const useCurrency = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: 'FCFA',
      setCurrency: (currency) => set({ currency }),
      toggle: () => set({ currency: get().currency === 'FCFA' ? 'EUR' : 'FCFA' }),
    }),
    { name: 'chanoa-currency' }
  )
)
