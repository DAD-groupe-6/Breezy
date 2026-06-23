// Utilitaires pour gérer les cookies

const LOCALE_COOKIE = 'breezy-locale'
const AUTH_COOKIE = 'token'
const COOKIE_MAX_AGE = 31536000 // 1 year in seconds

// ============= LOCALE COOKIE =============
export function getLang() {
  if (typeof document === 'undefined') return null
  const nameEQ = LOCALE_COOKIE + '='
  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length))
    }
  }
  return null
}

export function setLang(lang) {
  if (typeof document === 'undefined') return
  const value = encodeURIComponent(lang)
  document.cookie = `${LOCALE_COOKIE}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

// ============= THEME COOKIE =============
const THEME_COOKIE = 'breezy-theme'

export function getTheme() {
  if (typeof document === 'undefined') return null
  const nameEQ = THEME_COOKIE + '='
  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length))
    }
  }
  return null
}

export function setTheme(theme) {
  if (typeof document === 'undefined') return
  const value = encodeURIComponent(theme)
  document.cookie = `${THEME_COOKIE}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

// ============= AUTH COOKIE =============
export function getToken() {
  if (typeof document === 'undefined') return null
  const nameEQ = AUTH_COOKIE + '='
  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length))
    }
  }
  return null
}

export function setToken(token) {
  if (typeof document === 'undefined') return
  const value = encodeURIComponent(token)
  document.cookie = `${AUTH_COOKIE}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

export function clearToken() {
  if (typeof document === 'undefined') return
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}
