import type { Metadata } from 'next'
import { Settings, User, LogOut } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/auth-server'
import ParametresClient from './ParametresClient'

export const metadata: Metadata = { title: 'Paramètres — Admin' }

interface Props {
  searchParams: Promise<{ success?: string; error?: string }>
}

export default async function AdminParametresPage({ searchParams }: Props) {
  const { success, error } = await searchParams

  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

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
          {decodeURIComponent(error)}
        </div>
      )}

      {/* Admin profile */}
      <section className="mb-6 rounded-xl border bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b px-6 py-4">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Mon profil administrateur</h2>
        </div>
        <ParametresClient userId={user.id} userEmail={user.email} />
      </section>

      {/* Info */}
      <section className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Informations système</h2>
        </div>
        <div className="divide-y px-6 py-2 text-sm">
          {[
            { label: 'Rôle',    value: user.role === 'admin' ? 'Administrateur' : 'Utilisateur' },
            { label: 'User ID', value: user.id.slice(0, 8).toUpperCase() },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium font-mono text-xs">{value}</span>
            </div>
          ))}
        </div>
        <div className="border-t p-4">
          <a
            href="/api/auth/logout"
            className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium text-destructive hover:bg-red-50 w-fit"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </a>
        </div>
      </section>
    </div>
  )
}
