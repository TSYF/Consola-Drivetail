import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    const params = request.nextUrl.searchParams;
    const response = await fetch(`${API_URL}/api/reserva?${params.toString()}`, {
      headers: { 
        Authorization: token ? `Bearer ${token}` : '', 
        'Content-Type': 'application/json',

      },
    })
    const data = await response.json()
    const apiResponse = NextResponse.json(data);
    apiResponse.headers.set('X-Total-Count', response.headers.get('X-Total-Count') || '0');
    if (!response.ok) return NextResponse.json({ message: data.message || 'Failed to fetch reservas' }, { status: response.status });
    return apiResponse;
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    const body = await request.json()
    const response = await fetch(`${API_URL}/api/reserva`, {
      method: 'POST',
      headers: { 
        Authorization: token ? `Bearer ${token}` : '', 
        'Content-Type': 'application/json',

      },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    if (!response.ok) return NextResponse.json({ message: data.message || 'Failed to create reserva' }, { status: response.status })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
