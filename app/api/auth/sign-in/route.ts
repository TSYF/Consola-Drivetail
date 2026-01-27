import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Origin': 'https://agendashop.fabersoft.cl',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Authentication failed' },
        { status: response.status }
      )
    }

    // Check if user has admin role
    if (data.user && data.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can access this application.' },
        { status: 403 }
      )
    }

    // Set auth cookie
    const res = NextResponse.json(data)
    if (data.token) {
      res.cookies.set('auth_token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })

      // Store user role in a separate cookie for middleware access
      if (data.user?.role) {
        res.cookies.set('user_role', data.user.role, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24, // 24 hours
          path: '/',
        })
      }
    }

    return res
  } catch (error) {
    console.error('[v0] Auth sign-in error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
