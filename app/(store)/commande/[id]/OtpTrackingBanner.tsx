'use client'

import { useState } from 'react'
import { LogIn, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function OtpTrackingBanner({ email }: { email: string }) {
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  async function sendOtp() {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
        <div>
          <p className="text-sm font-semibold text-green-800">Lien de connexion envoyé !</p>
          <p className="mt-0.5 text-sm text-green-700">
            Consultez votre boîte mail (<span className="font-medium">{email}</span>) et cliquez
            sur le lien pour accéder à vos commandes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <LogIn className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Suivre l'évolution de votre commande</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Recevez un lien de connexion sur <span className="font-medium">{email}</span> pour
            accéder à votre historique de commandes et suivre les livraisons.
          </p>
          {error && (
            <p className="mt-1.5 text-xs text-destructive">{error}</p>
          )}
          <button
            onClick={sendOtp}
            disabled={loading}
            className="mt-3 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Envoi en cours…
              </>
            ) : (
              'Recevoir le lien de connexion'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
