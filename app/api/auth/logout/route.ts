import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'
const SECURE = process.env.COOKIE_SECURE === 'true'

// POST — appelé par useAuth.logout() pour invalider la session NestJS et effacer les cookies
export async function POST(req: NextRequest): Promise<NextResponse> {
  const refreshToken = req.cookies.get('refresh_token')?.value

  // Invalider la session côté NestJS (best-effort)
  if (refreshToken) {
    try {
      await axios.post(`${API_URL}/auth/logout`, { refreshToken })
    } catch { /* ignorer si backend down */ }
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('access_token', '', { maxAge: 0, path: '/' })
  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: SECURE,
    maxAge: 0,
    path: '/',
  })
  return response
}

// GET — redirection legacy (garde la compatibilité)
export async function GET(): Promise<NextResponse> {
  const response = NextResponse.redirect(
    new URL('/auth/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
  )
  response.cookies.set('access_token', '', { maxAge: 0, path: '/' })
  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: SECURE,
    maxAge: 0,
    path: '/',
  })
  return response
}
