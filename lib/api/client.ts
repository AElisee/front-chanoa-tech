/**
 * Instance Axios centrale avec gestion JWT (accessToken en mémoire + refresh via cookie httpOnly).
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'

// ── Store en mémoire pour l'accessToken ───────────────────────────────────────

let _accessToken: string | null = null

export function setAccessToken(token: string): void {
  _accessToken = token
}

export function clearAccessToken(): void {
  _accessToken = null
}

// ── Création de l'instance ────────────────────────────────────────────────────

// Côté serveur, on utilise l'URL interne (localhost) pour éviter de passer
// par l'IP publique et les règles UFW. Côté client (navigateur), on utilise
// l'URL publique définie dans NEXT_PUBLIC_API_URL.
const baseURL =
  typeof window === 'undefined'
    ? (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3200')
    : process.env.NEXT_PUBLIC_API_URL

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true, // nécessaire pour envoyer le cookie refresh_token
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Intercepteur request : injection du Bearer token ─────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (_accessToken) {
      config.headers.set('Authorization', `Bearer ${_accessToken}`)
    }
    return config
  },
  (error: unknown) => Promise.reject(error)
)

// ── Intercepteur response : gestion du 401 et refresh automatique ─────────────

// Extension du type de config pour ajouter le flag anti-boucle
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as RetryConfig | undefined

    // Si 401 et que l'on n'a pas encore retentié, on tente le refresh
    if (
      error.response?.status === 401 &&
      originalConfig &&
      !originalConfig._retry
    ) {
      originalConfig._retry = true

      try {
        // Passe par la route Next.js qui lit le cookie httpOnly refresh_token côté serveur
        const { data } = await axios.post<{ access_token: string }>(
          '/api/auth/refresh',
          {},
        )

        setAccessToken(data.access_token)

        // Rejoue la requête originale avec le nouveau token
        originalConfig.headers.set('Authorization', `Bearer ${data.access_token}`)
        return apiClient(originalConfig)
      } catch {
        // Le refresh a échoué : on nettoie le token et on laisse l'erreur remonter
        clearAccessToken()
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)
