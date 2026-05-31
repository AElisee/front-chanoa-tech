'use client'

import { useEffect } from 'react'
import { setAccessToken } from '@/lib/api/client'

/**
 * Hydrate le token d'accès en mémoire depuis le cookie `access_token`
 * (cookie non-httpOnly posé lors du login, lisible par JS).
 * Sans ça, chaque refresh de page vide le _accessToken en mémoire et
 * les appels API clients échouent avec 401.
 */
export default function AuthInitializer() {
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/)
    if (match?.[1]) {
      setAccessToken(decodeURIComponent(match[1]))
    }
  }, [])

  return null
}
