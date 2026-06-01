import type { Metadata } from 'next'
<<<<<<< HEAD
import { Settings, User } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/auth-server'
import ParametresClient from './ParametresClient'
import LogoutButton from './LogoutButton'
=======
import { Settings, User, CreditCard, Mail } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { cookies } from 'next/headers'
import { apiClient } from '@/lib/api/client'
import type { PaymentSetting } from '@/lib/api/settings'
import ParametresClient from './ParametresClient'
import LogoutButton from './LogoutButton'
import PaymentSettingsForm from '@/components/admin/PaymentSettingsForm'
>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e

export const metadata: Metadata = { title: 'Paramètres — Admin' }

interface Props {
  searchParams: Promise<{ success?: string; error?: string }>
}

export default async function AdminParametresPage({ searchParams }: Props) {
  const { success, error } = await searchParams

  const user = await getAuthenticatedUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'admin') redirect('/')

<<<<<<< HEAD
=======
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  let paymentSettings: PaymentSetting[] = []
  let emailSettings: PaymentSetting[] = []
  try {
    const [paymentRes, emailRes] = await Promise.all([
      apiClient.get<PaymentSetting[]>('/settings/payment', { headers }),
      apiClient.get<PaymentSetting[]>('/settings/email', { headers }),
    ])
    paymentSettings = paymentRes.data
    emailSettings = emailRes.data
  } catch {
    // silencieux — les sections seront vides
  }

>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
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

<<<<<<< HEAD
=======
      {/* Paiement GeniusPay */}
      <section className="mb-6 rounded-xl border bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b px-6 py-4">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <div>
            <h2 className="font-semibold">Configuration GeniusPay</h2>
            <p className="text-xs text-muted-foreground">
              Clés API stockées chiffrées en base. Les valeurs ne sont jamais affichées en clair.
            </p>
          </div>
        </div>
        {paymentSettings.length > 0 ? (
          <PaymentSettingsForm initialSettings={paymentSettings} />
        ) : (
          <p className="px-6 py-4 text-sm text-muted-foreground">
            Impossible de charger la configuration GeniusPay. Vérifiez que le backend est accessible.
          </p>
        )}
      </section>

      {/* Email SMTP */}
      <section className="mb-6 rounded-xl border bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b px-6 py-4">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <div>
            <h2 className="font-semibold">Configuration Email (SMTP)</h2>
            <p className="text-xs text-muted-foreground">
              Serveur d&apos;envoi des emails de confirmation et de suivi commandes.
            </p>
          </div>
        </div>
        {emailSettings.length > 0 ? (
          <PaymentSettingsForm initialSettings={emailSettings} type="email" />
        ) : (
          <p className="px-6 py-4 text-sm text-muted-foreground">
            Impossible de charger la configuration email. Vérifiez que le backend est accessible.
          </p>
        )}
      </section>

>>>>>>> 52e6449f83e744f2b246aa1a2f315aa25bbae59e
      {/* Admin profile + password */}
      <section className="mb-6 rounded-xl border bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b px-6 py-4">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Mon profil administrateur</h2>
        </div>
        <ParametresClient userId={user.id} userEmail={user.email} />
      </section>

      {/* Info système */}
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
          <LogoutButton />
        </div>
      </section>
    </div>
  )
}
