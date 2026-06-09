export function validateLogin(email, password) {
  const errors = {}
  if (!email) errors.email = "L'email est requis"
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email invalide'
  if (!password) errors.password = 'Le mot de passe est requis'
  return errors
}

export function validateRegister(username, email, password, confirm) {
  const errors = {}
  if (!username) errors.username = "Le nom d'utilisateur est requis"
  if (!email) errors.email = "L'email est requis"
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email invalide'
  if (!password) errors.password = 'Le mot de passe est requis'
  else if (password.length < 8) errors.password = 'Minimum 8 caractères'
  if (confirm !== password) errors.confirm = 'Les mots de passe ne correspondent pas'
  return errors
}
