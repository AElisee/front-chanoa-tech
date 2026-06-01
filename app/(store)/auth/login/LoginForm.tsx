'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'
import { Laptop, ShieldCheck } from 'lucide-react'
import { AxiosError } from 'axios'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? ''

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/compte'
  const [loading, setLoading] = useState(false)
  const [emailVal, setEmailVal] = useState('')
  const [passVal,  setPassVal]  = useState('')
  const { login } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { user } = await login(emailVal, passVal).then(() => useAuth.getState())

      if (user?.role === 'admin' || user?.role === 'livreur') {
        router.replace('/admin')
        return
      }

      router.replace(redirect)
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>
      const message =
        axiosErr.response?.data?.message ?? 'Identifiants incorrects.'
      toast.error(message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Laptop className="mb-2 h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Connexion</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bienvenue sur Chanoa Tech
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={emailVal}
              onChange={(e) => setEmailVal(e.target.value)}
              placeholder="vous@exemple.com"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Link
<<<<<<< HEAD
                href="/auth/reset-password"
=======
                href="/auth/forgot-password"
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={passVal}
              onChange={(e) => setPassVal(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>

        {/* Admin quick-access — dev only: pre-fills email, password still required */}
        {ADMIN_EMAIL && (
          <div className="mt-6 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-800">Accès rapide — Dev uniquement</span>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => { setEmailVal(ADMIN_EMAIL); toast.info('Email admin pré-rempli. Saisissez le mot de passe.') }}
              className="w-full rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
            >
              Pré-remplir l&apos;email admin
            </button>
          </div>
        )}

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Pas encore de compte ?{' '}
          <Link href="/auth/signup" className="font-medium text-primary hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
