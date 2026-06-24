'use client'

import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import fr from '@/locales/fr'
import en from '@/locales/en'
import { getLang, setLang } from '@/utils/cookie'

const LOCALES = { fr, en }
const VALID_LOCALES = ['fr', 'en']

const LanguageContext = createContext(null)

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

function detectBrowserLanguage() {
  if (typeof navigator === 'undefined') return 'fr'
  const lang = navigator.language || navigator.userLanguage || 'fr'
  const shortLang = lang.split('-')[0]
  return VALID_LOCALES.includes(shortLang) ? shortLang : 'fr'
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    const saved = getLang()
    if (VALID_LOCALES.includes(saved)) {
      return saved
    }
    return detectBrowserLanguage()
  })

  const setLocale = useCallback((lang) => {
    if (!VALID_LOCALES.includes(lang)) return
    setLang(lang)
    setLocaleState(lang)
  }, [])

  const t = useCallback(
    (key) => {
      const strings = LOCALES[locale]
      const value = getNestedValue(strings, key)
      return value ?? key
    },
    [locale]
  )

  const contextValue = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
