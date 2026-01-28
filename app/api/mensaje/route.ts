import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    const response = await fetch(`${API_URL}/api/mensaje`, {
      headers: { 
        Authorization: token ? `Bearer ${token}` : '', 
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    if (!response.ok) return NextResponse.json({ message: data.message || 'Failed to fetch mensajes' }, { status: response.status })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    const body = await request.json()
    const response = await fetch(`${API_URL}/api/mensaje`, {
      method: 'POST',
      headers: { 
        Authorization: token ? `Bearer ${token}` : '', 
        'Content-Type': 'application/json',
        'Origin': process.env.NEXT_PUBLIC_API_URL as string
      },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    if (!response.ok) return NextResponse.json({ message: data.message || 'Failed to create mensaje' }, { status: response.status })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
