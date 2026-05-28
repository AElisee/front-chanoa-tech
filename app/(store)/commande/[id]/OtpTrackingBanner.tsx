'use client'

import { LogIn } from 'lucide-react'
import Link from 'next/link'

export default function OtpTrackingBanner({ email }: { email: string }) {
  return (
    <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <LogIn className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Suivre l'évolution de votre commande</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Créez un compte avec l'adresse <span className="font-medium">{email}</span> pour
            accéder à votre historique de commandes et suivre les livraisons.
          </p>
          <Link
            href={`/auth/register?email=${encodeURIComponent(email)}`}
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Créer mon compte
          </Link>
        </div>
      </div>
    </div>
  )
}
