'use client'

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import type { InitiatePaymentResponse } from '@/lib/api/payment'

export default function RetryPaymentButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRetry() {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.post<InitiatePaymentResponse>('/payment/initiate', { orderId })
      if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl
      } else {
        setError('Lien de paiement non reçu. Réessayez dans quelques instants.')
        setLoading(false)
      }
    } catch {
      setError('Impossible de lancer le paiement. Réessayez ou contactez le support.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleRetry}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <CreditCard className="h-4 w-4" />}
        {loading ? 'Redirection en cours…' : 'Réessayer le paiement en ligne'}
      </button>
      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
