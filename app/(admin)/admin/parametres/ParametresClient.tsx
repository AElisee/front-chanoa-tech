'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { usersApi } from '@/lib/api/users'
import { apiClient } from '@/lib/api/client'

interface Props {
  userId: string
  userEmail: string
}

export default function ParametresClient({ userId, userEmail }: Props) {
  const router = useRouter()

  // ── Profil ────────────────────────────────────────────────────────────────
  const [name, setName]   = useState('')
  const [phone, setPhone] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError]   = useState<string | null>(null)

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    setProfileError(null)
    try {
      await usersApi.updateUser(userId, {
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
      })
      router.push('/admin/parametres?success=1')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour.'
      setProfileError(msg)
    } finally {
      setSavingProfile(false)
    }
  }

  // ── Mot de passe ──────────────────────────────────────────────────────────
  const [password, setPassword]           = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError]   = useState<string | null>(null)

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setPasswordError('Le mot de passe doit comporter au moins 8 caractères.')
      return
    }
    setSavingPassword(true)
    setPasswordError(null)
    try {
      // PATCH /user/:id accepte { password } — UserService hache automatiquement
      await apiClient.patch(`/user/${userId}`, { password })
      setPassword('')
      router.push('/admin/parametres?success=1')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const msg = axiosErr.response?.data?.message ?? 'Erreur lors du changement de mot de passe.'
      setPasswordError(msg)
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <>
      {/* Profil */}
      <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email (non modifiable)</label>
          <input
            value={userEmail}
            disabled
            readOnly
            className="w-full rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Nom complet</label>
          <input
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Prénom Nom"
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Téléphone</label>
          <input
            name="phone"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+225 XX XX XX XX"
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        {profileError && (
          <p className="text-sm text-destructive">{profileError}</p>
        )}
        <button
          type="submit"
          disabled={savingProfile}
          className="flex items-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {savingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Enregistrer
        </button>
      </form>

      {/* Séparateur */}
      <div className="border-t mx-6" />

      {/* Mot de passe */}
      <div className="px-6 py-4">
        <h2 className="font-semibold mb-4">Changer le mot de passe</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Nouveau mot de passe</label>
            <input
              name="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={8}
              required
              placeholder="8 caractères minimum"
              className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          {passwordError && (
            <p className="text-sm text-destructive">{passwordError}</p>
          )}
          <button
            type="submit"
            disabled={savingPassword}
            className="flex items-center gap-2 rounded-md bg-muted px-6 py-2 text-sm font-medium hover:bg-muted/70 disabled:opacity-60"
          >
            {savingPassword && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Mettre à jour le mot de passe
          </button>
        </form>
      </div>
    </>
  )
}
