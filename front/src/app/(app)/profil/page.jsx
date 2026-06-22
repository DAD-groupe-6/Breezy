'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import { getToken } from '@/utils/cookie'
import ProfileView from '@/components/profile/ProfileView'

export default function MyProfilPage() {
  const router = useRouter()
  const [myId, setMyId] = useState(null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }
    const { id } = jwtDecode(token)
    setMyId(id)
  }, [])

  if (!myId) return null

  return <ProfileView userId={myId} isOwnProfile={true} />
}