'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KeyRound, CheckCircle, XCircle } from 'lucide-react'
import { authApi } from '@/lib/api/auth'
import { AxiosError } from 'axios'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [pass, setPass] = useState('')
  const [passConfirm, setPassConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Token absent : lien invalide ou incomplet
  if (!token) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-7 w-7 text-red-500" />
          </div>
          <h1 className="text-xl font-bold">Lien invalide</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ce lien de réinitialisation est incorrect ou a expiré.
          </p>
          <Link
            href="/auth/forgot-password"
            className="mt-5 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (pass.length < 8) {
      setError('Le mot de passe doit comporter au moins 8 caractères.')
      return
    }
    if (pass !== passConfirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      await authApi.resetPassword(token, pass, passConfirm)
      setSuccess(true)
    } catch (err) {
      const msg = (err as AxiosError<{ message?: string }>).response?.data?.message
        ?? 'Lien expiré ou invalide. Demandez un nouveau lien.'
      setError(msg)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Mot de passe mis à jour</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Votre mot de passe a été réinitialisé avec succès.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choisissez un mot de passe sécurisé d&apos;au moins 8 caractères.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pass">Nouveau mot de passe</Label>
            <Input
              id="pass"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="8 caractères minimum"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="passConfirm">Confirmer le mot de passe</Label>
            <Input
              id="passConfirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Répétez le mot de passe"
              value={passConfirm}
              onChange={(e) => setPassConfirm(e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Mise à jour…' : 'Réinitialiser le mot de passe'}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Le lien expire après 1 heure.{' '}
          <Link href="/auth/forgot-password" className="text-primary hover:underline">
            Demander un nouveau lien
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
