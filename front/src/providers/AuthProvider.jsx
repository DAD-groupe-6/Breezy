'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import { getToken } from '@/utils/cookie'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setUser({
          id: decoded.id,
          role: decoded.role,
        })
      } catch (err) {
        console.error('Invalid token:', err)
        setUser(null)
      }
    }
    setLoading(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
