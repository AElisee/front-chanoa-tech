'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { usersApi } from '@/lib/api/users'
import { clearAccessToken } from '@/lib/api/client'

export default function ProfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState({ name: '', phone: '', email: '' })

  useEffect(() => {
    async function load() {
      try {
        const res = await authApi.getProfile()
        const data = res.data
        setUserId(data.id)
        setProfile({
          name: data.name ?? '',
          phone: data.phone ?? '',
          email: data.email,
        })
      } catch {
        router.push('/auth/login')
      }
    }
    load()
  }, [router])

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!userId) return
    setLoading(true)
    try {
      await usersApi.updateUser(userId, {
        name: profile.name,
        phone: profile.phone || null,
      })
      toast.success('Profil mis à jour')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch { /* ignorer */ }
    clearAccessToken()
    document.cookie = 'access_token=; path=/; max-age=0'
    router.push('/')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">Mon profil</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={profile.email} disabled className="bg-muted" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Nom complet</Label>
          <Input
            id="name"
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+225 XX XX XX XX"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </form>
      <Button
        variant="outline"
        className="mt-4 w-full text-destructive hover:text-destructive"
        onClick={handleSignOut}
      >
        Se déconnecter
      </Button>
    </div>
  )
}
