'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '@/utils/api'
import { useAuth } from '@/providers/AuthProvider'

const CurrentProfileContext = createContext(null)

export function CurrentProfileProvider({ children }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)

  const refreshProfile = useCallback(async () => {
    const id = user?.id
    if (!id) {
      setProfile(null)
      return
    }
    try {
      const { data } = await api.get(`/user/${id}`)
      setProfile(data)
    } catch {
      setProfile(null)
    }
  }, [user?.id])

  useEffect(() => {
    refreshProfile()
  }, [refreshProfile])

  return (
    <CurrentProfileContext.Provider value={{ profile, setProfile, refreshProfile }}>
      {children}
    </CurrentProfileContext.Provider>
  )
}

export function useCurrentProfile() {
  const ctx = useContext(CurrentProfileContext)
  if (!ctx) {
    throw new Error('useCurrentProfile must be used within CurrentProfileProvider')
  }
  return ctx
}
