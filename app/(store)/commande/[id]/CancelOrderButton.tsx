'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'
import { apiClient } from '@/lib/api/client'

interface Props {
  orderId: string
}

export default function CancelOrderButton({ orderId }: Props) {
  const router = useRouter()
  const [loading, setLoading]   = useState(false)
  const [confirm, setConfirm]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleCancel() {
    setLoading(true)
    setError(null)
    try {
      await apiClient.post(`/commande/${orderId}/cancel`)
      router.refresh()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Impossible d\'annuler la commande.'
      setError(msg)
    } finally {
      setLoading(false)
      setConfirm(false)
    }
  }

  if (confirm) {
    return (
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        <p className="text-sm text-muted-foreground">Confirmer l&apos;annulation ?</p>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Annulation…' : 'Oui, annuler'}
          </button>
          <button
            onClick={() => setConfirm(false)}
            disabled={loading}
            className="rounded-md border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Retour
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="inline-flex items-center gap-2 rounded-md border border-red-200 px-6 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
    >
      <XCircle className="h-4 w-4" />
      Annuler la commande
    </button>
  )
}
