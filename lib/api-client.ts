export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Call Next.js API routes - auth token is in httpOnly cookie
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }))
    throw new ApiError(
      error.message || `HTTP ${response.status}`,
      response.status,
      error
    )
  }

  return response
}

export const apiClient = {
  async get<T>(url: string): Promise<T> {
    const response = await fetchWithAuth(url, { method: 'GET' })
    return response.json()
  },

  async post<T>(url: string, data: unknown): Promise<T> {
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async put<T>(url: string, data: unknown): Promise<T> {
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async patch<T>(url: string, data: unknown): Promise<T> {
    const response = await fetchWithAuth(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async delete<T>(url: string): Promise<T> {
    const response = await fetchWithAuth(url, { method: 'DELETE' })
    return response.json()
  },
}
