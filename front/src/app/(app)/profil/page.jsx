'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import { getToken } from '@/utils/cookie'
import ProfileView from '@/components/profil/ProfileView'

export default function MyProfilPage() {
  const router = useRouter()
  const [myId, setMyId] = useState(null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }
    try {
      const { id } = jwtDecode(token)
      setMyId(id)
    } catch {
      router.push('/login')
    }
  }, [router])

  if (!myId) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <p className="text-[var(--color-text-secondary)]">Chargement...</p>
      </div>
    )
  }

  return <ProfileView userId={myId} isOwnProfile />
}