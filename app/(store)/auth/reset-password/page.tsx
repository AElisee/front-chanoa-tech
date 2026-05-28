'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'
import { AxiosError } from 'axios'

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { forgotPassword } = useAuth()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const data = new FormData(e.currentTarget)

    try {
      await forgotPassword(data.get('email') as string)
      setSent(true)
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>
      const message =
        axiosErr.response?.data?.message ?? 'Une erreur est survenue.'
      toast.error(message)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold">Email envoyé</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Si cette adresse est enregistrée, vous recevrez un lien de
            réinitialisation.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold">Mot de passe oublié</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Adresse email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Envoi…' : 'Envoyer le lien'}
          </Button>
        </form>
      </div>
    </div>
  )
}
