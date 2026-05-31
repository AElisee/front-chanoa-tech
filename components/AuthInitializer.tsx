'use client'

import { useEffect } from 'react'
import { setAccessToken } from '@/lib/api/client'
import { useAuth } from '@/lib/hooks/useAuth'

/**
 * Hydrate l'état auth au chargement de chaque page :
 * 1. Lit le cookie `access_token` (non-httpOnly) et le pose en mémoire
 *    pour que apiClient envoie le header Authorization sans 401.
 * 2. Appelle useAuth.init() si le store n'est pas encore initialisé,
 *    pour peupler useAuth().user (nom, rôle, etc.) dans les composants client.
 */
export default function AuthInitializer() {
  const init        = useAuth((s) => s.init)
  const initialized = useAuth((s) => s.initialized)

  useEffect(() => {
    // Étape 1 — hydrater le token axios depuis le cookie non-httpOnly
    const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/)
    if (match?.[1]) {
      setAccessToken(decodeURIComponent(match[1]))
    }

    // Étape 2 — hydrater le store Zustand (user, role) si pas encore fait
    if (!initialized) {
      init()
    }
  }, [init, initialized])

  return null
}
