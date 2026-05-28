'use client'
import { create } from 'zustand'
import { authApi } from '@/lib/api/auth'
import { setAccessToken, clearAccessToken } from '@/lib/api/client'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  phone?: string | null
}

interface AuthStore {
  user: User | null
  isLoading: boolean
  initialized: boolean
  init: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  initialized: false,

  init: async () => {
    // Appelé une seule fois au montage du layout racine
    // Essaie de récupérer le profil avec le cookie existant
    try {
      const res = await authApi.getProfile()
      set({ user: res.data, initialized: true })
    } catch {
      set({ user: null, initialized: true })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const res = await authApi.login(email, password)
      const { accessToken, refreshToken, user } = res.data
      // Stocker access token en mémoire
      setAccessToken(accessToken)
      // Poser le refresh token en cookie httpOnly via la route Next.js
      await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      // Stocker l'access token aussi en cookie pour le middleware (SSR)
      document.cookie = `access_token=${accessToken}; path=/; max-age=3600; SameSite=Strict`
      set({ user, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  register: async (data) => {
    set({ isLoading: true })
    try {
      const res = await authApi.register(data)
      const { accessToken, refreshToken, user } = res.data
      setAccessToken(accessToken)
      await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      document.cookie = `access_token=${accessToken}; path=/; max-age=3600; SameSite=Strict`
      set({ user, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch { /* ignorer si API down */ }
    clearAccessToken()
    await fetch('/api/auth/set-cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: null }),
    })
    // Supprimer le cookie access_token
    document.cookie = 'access_token=; path=/; max-age=0'
    set({ user: null })
  },

  forgotPassword: async (email) => {
    await authApi.forgotPassword(email)
  },
}))
