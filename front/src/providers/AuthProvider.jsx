'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { jwtDecode } from 'jwt-decode'
import { getToken, setToken, clearToken } from '@/utils/cookie'
import { disconnectSocket } from '@/utils/socket'
import api from '@/utils/api'

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
  // Permissions du rôle, récupérées depuis le service Auth (source unique de vérité).
  // permsLoaded évite un "flash" : tant que ce n'est pas chargé, on ne montre rien de conditionné.
  const [permissions, setPermissions] = useState([])
  const [permsLoaded, setPermsLoaded] = useState(false)

  // Au démarrage : lit le token déjà présent (session persistée).
  useEffect(() => {
    setUser(userFromToken(getToken()))
    setLoading(false)
  }, [])

  // À chaque changement de rôle : (re)charge la liste des permissions depuis Auth.
  // On attend la fin du chargement initial (loading=false) pour éviter un flash
  // où permsLoaded=true avec permissions=[] avant que le token soit lu.
  useEffect(() => {
    let cancelled = false

    if (loading) return

    const roleId = user?.roleId

    if (roleId === null || roleId === undefined) {
      setPermissions([])
      setPermsLoaded(true)
      return
    }

    setPermsLoaded(false)
    api.get(`/auth/roles/${roleId}/permissions`)
      .then(({ data }) => { if (!cancelled) setPermissions(data?.permissions || []) })
      .catch(() => { if (!cancelled) setPermissions([]) })
      .finally(() => { if (!cancelled) setPermsLoaded(true) })

    return () => { cancelled = true }
  }, [user?.roleId, loading])

  // Vrai uniquement si la permission est explicitement accordée au rôle courant.
  const hasPermission = useCallback(
    (permissionName) => permissions.includes(permissionName),
    [permissions]
  )

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
    <AuthContext.Provider value={{ user, loading, login, logout, permissions, permsLoaded, hasPermission }}>
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
