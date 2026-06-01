import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { apiClient } from '@/lib/api/client'
import type { UserDto } from '@/lib/api/users'
import CheckoutForm from './CheckoutForm'

export const metadata: Metadata = { title: 'Finaliser la commande — Chanoa Tech' }

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function CheckoutPage({ searchParams }: Props) {
  const { error } = await searchParams

  // Récupérer le profil de l'utilisateur connecté pour pré-remplir le formulaire
  let initialUser: { email: string; name: string | null; phone: string | null } | null = null

  const user = await getAuthenticatedUser()
  if (user) {
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get('access_token')?.value
      const res = await apiClient.get<UserDto>(`/user/${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      initialUser = {
        email: res.data.email,
        name: res.data.name ?? null,
        phone: res.data.phone ?? null,
      }
    } catch {
      // Silencieux — le formulaire sera vide, l'utilisateur saisit manuellement
    }
  }

  return <CheckoutForm initialUser={initialUser} errorParam={error ?? null} />
}
