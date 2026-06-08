'use client'

import { useState } from 'react'
import Link from 'next/link'
import InputField from '@/components/ui/InputField'
import Button from '@/components/ui/Button'

function validate(form) {
  const errors = {}
  if (!form.username) errors.username = "Le nom d'utilisateur est requis"
  if (!form.email) errors.email = "L'email est requis"
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email invalide'
  if (!form.password) errors.password = 'Le mot de passe est requis'
  else if (form.password.length < 8) errors.password = 'Minimum 8 caractères'
  if (form.confirm !== form.password) errors.confirm = 'Les mots de passe ne correspondent pas'
  return errors
}

export default function RegisterForm() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})

  function update(field) {
    return (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const newErrors = validate(form)
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    // TODO: appel API POST /api/auth/register
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-slate-900">Créer un compte</h2>
        <p className="text-sm text-slate-500">Rejoins Breezy dès maintenant</p>
      </div>

      <InputField label="Nom d'utilisateur" id="username" value={form.username} onChange={update('username')} error={errors.username} placeholder="@tonpseudo" />
      <InputField label="Email" id="email" type="email" value={form.email} onChange={update('email')} error={errors.email} placeholder="exemple@email.com" />
      <InputField label="Mot de passe" id="password" type="password" value={form.password} onChange={update('password')} error={errors.password} placeholder="Minimum 8 caractères" />
      <InputField label="Confirmer le mot de passe" id="confirm" type="password" value={form.confirm} onChange={update('confirm')} error={errors.confirm} placeholder="••••••••" />

      <Button type="submit" fullWidth>Créer mon compte</Button>

      <p className="text-sm text-center text-slate-500">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-[#5B5EF4] font-medium hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  )
}
