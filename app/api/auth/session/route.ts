import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': 'https://agendashop.fabersoft.cl',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const data = await response.json()

    // Verify user has admin role
    if (data.user && data.user.role !== 'admin') {
      return NextResponse.json(
        { user: null, error: 'Access denied. Admin role required.' },
        { status: 403 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Session fetch error:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
