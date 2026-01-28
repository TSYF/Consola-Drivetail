import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get('auth_token')?.value
    const { id } = await params
    const response = await fetch(`${API_URL}/api/factura.transaccion/${id}`, {
      headers: { Authorization: token ? `Bearer ${token}` : '', 'Content-Type': 'application/json', 'Origin': process.env.NEXT_PUBLIC_API_URL as string },
    })
    const data = await response.json()
    if (!response.ok) return NextResponse.json({ message: data.message || 'Failed to fetch factura' }, { status: response.status })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
