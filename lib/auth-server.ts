import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback_secret'
)

export interface AuthUser {
  id: string
  email: string
  role: 'admin' | 'client'
}

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as 'admin' | 'client',
    }
  } catch {
    return null
  }
}
