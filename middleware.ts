import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback_secret'
)

const ADMIN_PREFIX  = '/admin'
const COMPTE_PREFIX = '/compte'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const needsAuth  = pathname.startsWith(COMPTE_PREFIX) || pathname.startsWith(ADMIN_PREFIX)
  const needsAdmin = pathname.startsWith(ADMIN_PREFIX)

  if (!needsAuth) return NextResponse.next()

  const token = req.cookies.get('access_token')?.value

  if (!token) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    if (needsAdmin && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  } catch {
    // Token expiré ou signature invalide
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/compte/:path*', '/admin/:path*'],
}
