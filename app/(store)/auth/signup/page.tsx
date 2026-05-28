'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'
import { Laptop } from 'lucide-react'
import { AxiosError } from 'axios'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const data = new FormData(e.currentTarget)

    try {
      await register({
        name: data.get('full_name') as string,
        email: data.get('email') as string,
        password: data.get('password') as string,
      })

      toast.success('Compte créé avec succès !')
      router.push('/compte')
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>
      const message =
        axiosErr.response?.data?.message ?? 'Erreur lors de la création du compte.'
      toast.error(message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Laptop className="mb-2 h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Créer un compte</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Rejoignez Chanoa Tech
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Nom complet</Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              required
              placeholder="Jean Dupont"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="vous@exemple.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="8 caractères minimum"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Création…' : 'Créer mon compte'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
