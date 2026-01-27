const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface User {
  id: string
  email: string
  name?: string
  image?: string
  role?: string
  createdAt?: string
  updatedAt?: string
}

export interface Session {
  user: User
  token: string
  expiresAt?: string
}

export interface AuthResponse {
  user?: User
  token?: string
  session?: Session
  error?: string
  message?: string
}

export class AuthClient {
  private static instance: AuthClient
  private session: Session | null = null

  private constructor() {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_session')
      if (stored) {
        try {
          this.session = JSON.parse(stored)
        } catch (e) {
          localStorage.removeItem('auth_session')
        }
      }
    }
  }

  static getInstance(): AuthClient {
    if (!AuthClient.instance) {
      AuthClient.instance = new AuthClient()
    }
    return AuthClient.instance
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Call Next.js API routes which will proxy to backend
    const response = await fetch(endpoint, {
      ...options,
      headers,
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Request failed')
    }

    return data
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const data = await this.request('/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      if (data.user && data.token) {
        this.session = {
          user: data.user,
          token: data.token,
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_session', JSON.stringify(this.session))
        }
      }

      return data
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Sign in failed',
      }
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.request('/api/auth/sign-out', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      this.session = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_session')
      }
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const data = await this.request('/api/auth/session')
      if (data.user) {
        // Token is stored in httpOnly cookie, managed by the server
        this.session = {
          user: data.user,
          token: 'cookie-managed', // Placeholder since cookie is httpOnly
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_session', JSON.stringify(this.session))
        }
        return this.session
      }
      return null
    } catch (error) {
      this.session = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_session')
      }
      return null
    }
  }

  getLocalSession(): Session | null {
    return this.session
  }

  async updateUser(updates: Partial<User>): Promise<AuthResponse> {
    try {
      const data = await this.request('/api/auth/update-user', {
        method: 'POST',
        body: JSON.stringify(updates),
      })

      if (data.user && this.session) {
        this.session.user = data.user
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_session', JSON.stringify(this.session))
        }
      }

      return data
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Update failed',
      }
    }
  }
}

export const authClient = AuthClient.getInstance()
