import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json() as { refreshToken?: string }
  const { refreshToken } = body

  const response = NextResponse.json({ ok: true })

  // COOKIE_SECURE=true uniquement quand le serveur tourne en HTTPS
  // (ne pas utiliser NODE_ENV=production car le serveur peut être en HTTP en production)
  const secure = process.env.COOKIE_SECURE === 'true'

  if (refreshToken) {
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure,
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    })
  } else {
    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      sameSite: 'strict',
      secure,
      maxAge: 0,
      path: '/',
    })
  }

  return response
}
