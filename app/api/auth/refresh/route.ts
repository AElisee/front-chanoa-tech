import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const refreshToken = req.cookies.get('refresh_token')?.value

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
  }

  try {
    const res = await axios.post<{ access_token: string }>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    )

    return NextResponse.json({ access_token: res.data.access_token })
  } catch {
    return NextResponse.json({ error: 'Refresh failed' }, { status: 401 })
  }
}
