/**
 * lib/utils/format.ts
 * Price formatting utilities for EUR and FCFA (XOF).
 * FCFA has no decimal subdivision — always display as integer.
 */

export const EUR_TO_FCFA = 655.957

export type Currency = 'FCFA' | 'EUR'

/** Format a FCFA amount: "850 000 FCFA" */
export function formatFCFA(amount: number): string {
  return amount.toLocaleString('fr-FR') + '\u00a0FCFA'
}

/** Format a EUR amount: "1 299,00 €" */
export function formatEUR(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Format a price in the requested currency.
 *  - priceEur: price in euros (reference)
 *  - priceFcfa: price in FCFA (primary stored value)
 */
export function formatPrice(
  priceFcfa: number,
  currency: Currency,
  priceEur?: number | null
): string {
  if (currency === 'EUR') {
    const eur = priceEur ?? priceFcfa / EUR_TO_FCFA
    return formatEUR(eur)
  }
  return formatFCFA(priceFcfa)
}

/** Calculate discount percentage between compare_price and price */
export function discountPercent(price: number, comparePrice: number): number {
  if (comparePrice <= price) return 0
  return Math.round(((comparePrice - price) / comparePrice) * 100)
}
