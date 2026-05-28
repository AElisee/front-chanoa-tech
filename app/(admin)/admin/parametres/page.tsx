import type { Metadata } from 'next'
import { Settings, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export const metadata: Metadata = { title: 'Paramètres — Admin' }

async function updateAdminProfile(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const full_name = (formData.get('full_name') as string)?.trim() || null
  const phone     = (formData.get('phone') as string)?.trim() || null

  await supabase.from('profiles').update({ full_name, phone }).eq('id', user.id)
  revalidatePath('/admin/parametres')
  redirect('/admin/parametres?success=1')
}

async function changePassword(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const password = formData.get('password') as string
  if (!password || password.length < 8) redirect('/admin/parametres?error=password_short')
  const { error } = await supabase.auth.updateUser({ password })
  if (error) redirect(`/admin/parametres?error=${encodeURIComponent(error.message)}`)
  redirect('/admin/parametres?success=1')
}

interface Props {
  searchParams: Promise<{ success?: string; error?: string }>
}

export default async function AdminParametresPage({ searchParams }: Props) {
  const { success, error } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, phone, role')
    .eq('id', user.id)
    .single()

  const errorMessages: Record<string, string> = {
    password_short: 'Le mot de passe doit comporter au moins 8 caractères.',
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Settings className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Paramètres</h1>
      </div>

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
          Modifications enregistrées.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {errorMessages[error] ?? decodeURIComponent(error)}
        </div>
      )}

      {/* Admin profile */}
      <section className="mb-6 rounded-xl border bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b px-6 py-4">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Mon profil administrateur</h2>
        </div>
        <form action={updateAdminProfile} className="p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email (non modifiable)</label>
            <input
              value={profile?.email ?? user.email ?? ''}
              disabled
              className="w-full rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground"
              readOnly
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Nom complet</label>
            <input
              name="full_name"
              defaultValue={profile?.full_name ?? ''}
              placeholder="Prénom Nom"
              className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Téléphone</label>
            <input
              name="phone"
              type="tel"
              defaultValue={profile?.phone ?? ''}
              placeholder="+225 XX XX XX XX"
              className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Enregistrer
          </button>
        </form>
      </section>

      {/* Change password */}
      <section className="mb-6 rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Changer le mot de passe</h2>
        </div>
        <form action={changePassword} className="p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Nouveau mot de passe</label>
            <input
              name="password"
              type="password"
              minLength={8}
              required
              placeholder="8 caractères minimum"
              className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-muted px-6 py-2 text-sm font-medium hover:bg-muted/70"
          >
            Mettre à jour le mot de passe
          </button>
        </form>
      </section>

      {/* Info */}
      <section className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Informations système</h2>
        </div>
        <div className="divide-y px-6 py-2 text-sm">
          {[
            { label: 'Rôle',        value: profile?.role === 'admin' ? 'Administrateur' : 'Utilisateur' },
            { label: 'User ID',     value: user.id.slice(0, 8).toUpperCase() },
            { label: 'Dernière connexion', value: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('fr-FR') : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium font-mono text-xs">{value}</span>
            </div>
          ))}
        </div>
        <div className="border-t p-4">
          <form action={async () => {
            'use server'
            const supabase = await createClient()
            await supabase.auth.signOut()
            redirect('/auth/login')
          }}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium text-destructive hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
