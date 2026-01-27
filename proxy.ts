import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get auth token and role from cookies
  const authToken = request.cookies.get('auth_token')?.value
  const userRole = request.cookies.get('user_role')?.value

  // Check if the path is protected (dashboard routes)
  const isProtectedRoute = pathname.startsWith('/dashboard')
  const isAuthRoute = pathname.startsWith('/login')

  // Check if user is authenticated and has admin role
  const isAuthenticated = authToken && userRole === 'admin'

  // Redirect authenticated admin users away from login
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated or non-admin users to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
