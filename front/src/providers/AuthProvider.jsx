'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { jwtDecode } from 'jwt-decode'
import { getToken, setToken, clearToken } from '@/utils/cookie'
import { disconnectSocket } from '@/utils/socket'

const AuthContext = createContext(null)

// Décode le JWT en infos d'affichage (id, role). Null si absent/invalide.
function userFromToken(token) {
  if (!token) return null
  try {
    const decoded = jwtDecode(token)
    const roleId = decoded.roleId ?? null
    const roleName = decoded.role ?? null
    return { id: decoded.id, roleId, role: roleId, roleName }
  } catch (err) {
    console.error('Invalid token:', err)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Au démarrage : lit le token déjà présent (session persistée).
  useEffect(() => {
    setUser(userFromToken(getToken()))
    setLoading(false)
  }, [])

  // Connexion : pose le cookie ET met à jour l'état tout de suite (sans rechargement).
  const login = useCallback((token) => {
    setToken(token)
    setUser(userFromToken(token))
  }, [])

  // Déconnexion : ferme le socket (sinon il reste dans la room de l'ancien user),
  // efface le cookie et l'état.
  const logout = useCallback(() => {
    disconnectSocket()
    clearToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
