import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-server'

export async function GET(): Promise<NextResponse> {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }
  return NextResponse.json({ id: user.id, email: user.email, role: user.role })
}
