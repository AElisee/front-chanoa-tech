'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function ProfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({ full_name: '', phone: '', email: '' })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', user.id)
        .single() as { data: { full_name: string | null; email: string; phone: string | null } | null }
      if (data) {
        setProfile({
          full_name: data.full_name ?? '',
          phone: data.phone ?? '',
          email: data.email,
        })
      }
    }
    load()
  }, [router])

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: profile.full_name, phone: profile.phone })
      .eq('id', user.id)

    if (error) toast.error(error.message)
    else toast.success('Profil mis à jour')
    setLoading(false)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
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
          <Label htmlFor="full_name">Nom complet</Label>
          <Input
            id="full_name"
            value={profile.full_name}
            onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
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
