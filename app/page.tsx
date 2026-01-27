'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth'
import { Spinner } from '@/components/ui/spinner'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const session = authClient.getLocalSession()
      if (session?.token) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  return (
    <div className="h-screen flex items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  )
}
