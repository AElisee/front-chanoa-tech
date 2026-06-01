import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback_secret'
)

async function verifyToken(token: string): Promise<{ id: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { id: payload.sub as string, role: payload.role as string }
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only run auth logic for protected routes
  const isProtected = pathname.startsWith('/compte') || pathname.startsWith('/admin')
  if (!isProtected) {
    return NextResponse.next({ request })
  }

  const token = request.cookies.get('access_token')?.value
  const user = token ? await verifyToken(token) : null

  // Protect /compte/* — must be logged in
  if (pathname.startsWith('/compte') && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Protect /admin/* — must be admin
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/auth/login'
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (user.role !== 'admin') {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/'
      return NextResponse.redirect(homeUrl)
    }
  }

  // Injecter les infos utilisateur en headers pour les Server Components
  const response = NextResponse.next({ request })
  if (user) {
    response.headers.set('x-user-id', user.id)
    response.headers.set('x-user-role', user.role)
  }
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image
     * - favicon.ico
     * - Public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
