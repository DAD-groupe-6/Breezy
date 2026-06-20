// Lettres, chiffres, espaces, tirets et underscores uniquement (bloque les emoji, etc.)
const NAME_REGEX = /^[\p{L}\p{N} _-]+$/u

export function validateLogin(email, password, t) {
  const errors = {}
  if (!email) errors.email = t('errors.email.required')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = t('errors.email.invalid')
  if (!password) errors.password = t('errors.password.required')
  return errors
}

export function validateRegister(username, email, password, confirm, t) {
  const errors = {}
  if (!username) errors.username = t('errors.username.required')
  else if (!NAME_REGEX.test(username)) errors.username = t('errors.username.invalid')
  if (!email) errors.email = t('errors.email.required')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = t('errors.email.invalid')
  if (!password) errors.password = t('errors.password.required')
  else if (password.length < 8) errors.password = t('errors.password.minLength')
  if (confirm !== password) errors.confirm = t('errors.confirm.mismatch')
  return errors
}
