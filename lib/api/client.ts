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

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
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
        // Le refreshToken est dans le cookie httpOnly — withCredentials l'envoie automatiquement
        const { data } = await axios.post<{ access_token: string }>(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
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
