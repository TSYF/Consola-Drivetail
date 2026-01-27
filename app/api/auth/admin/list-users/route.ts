import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value

    // Get query parameters from the request URL
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()

    // Build the backend URL with query parameters
    const backendUrl = `${API_URL}/api/auth/admin/list-users${queryString ? `?${queryString}` : ''}`

    const response = await fetch(backendUrl, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch users' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Error fetching users:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
