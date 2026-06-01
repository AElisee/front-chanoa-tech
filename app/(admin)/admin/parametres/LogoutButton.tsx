'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { clearAccessToken } from '@/lib/api/client'
import { useAuth } from '@/lib/hooks/useAuth'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch { /* ignorer */ }
    clearAccessToken()
    document.cookie = 'access_token=; path=/; max-age=0'
    useAuth.setState({ user: null, initialized: false })
    router.push('/auth/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium text-destructive hover:bg-red-50 w-fit"
    >
      <LogOut className="h-4 w-4" />
      Se déconnecter
    </button>
  )
}
