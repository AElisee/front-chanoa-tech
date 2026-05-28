import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json() as { refreshToken?: string }
  const { refreshToken } = body

  const response = NextResponse.json({ ok: true })

  if (refreshToken) {
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    })
  } else {
    response.cookies.delete('refresh_token')
  }

  return response
}
