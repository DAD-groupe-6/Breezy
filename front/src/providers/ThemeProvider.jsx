'use client'

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { getTheme, setTheme } from '@/utils/cookie'

const ThemeContext = createContext(null)
const VALID_THEMES = ['light', 'dark', 'discord', 'gaming', 'neon', 'ocean', 'minty', 'sunset', 'forest', 'berry', 'lavender']

function detectBrowserTheme() {
  if (typeof window === 'undefined') return 'light'
  const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  return darkMode ? 'dark' : 'light'
}

function applyThemeToDocument(theme) {
  if (typeof document === 'undefined') return
  const htmlElement = document.documentElement
  htmlElement.setAttribute('data-theme', theme)
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const saved = getTheme()
    const isValidTheme = VALID_THEMES.includes(saved)
    const themeToApply = isValidTheme ? saved : detectBrowserTheme()
    
    // Sauvegarde le thème initial si c'est la première visite
    if (!isValidTheme) {
      setTheme(themeToApply)
    }
    
    setThemeState(themeToApply)
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      applyThemeToDocument(theme)
    }
  }, [theme, isMounted])

  const updateTheme = useCallback((newTheme) => {
    if (!VALID_THEMES.includes(newTheme)) return
    setTheme(newTheme)
    setThemeState(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    const lightDarkThemes = ['light', 'dark']
    const currentIndex = lightDarkThemes.indexOf(theme)
    const nextTheme = lightDarkThemes[(currentIndex + 1) % lightDarkThemes.length]
    updateTheme(nextTheme)
  }, [theme, updateTheme])

  const contextValue = useMemo(() => ({ 
    theme, 
    setTheme: updateTheme, 
    toggleTheme, 
    availableThemes: VALID_THEMES 
  }), [theme, updateTheme, toggleTheme])

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider')
  }
  return context
}
