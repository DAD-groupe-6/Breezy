'use client'

import { useState } from 'react'
import Link from 'next/link'
import InputField from '@/components/ui/InputField'
import Button from '@/components/ui/Button'
import { validateLogin } from '@/utils/validation'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    const newErrors = validateLogin(email, password)
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({});

    setLoading(true);
    try{
        const { data } = await axios.post('/api/v1/auth/login', { email, password })
        localStorage.setItem('token', data.token)
        router.push('/')
    }catch(err){
        const message = err.response?.data?.message || 'Erreur réseau, réessaie plus tard'
        setErrors({ general: message })
    } finally {
        setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-slate-900">Connexion</h2>
        <p className="text-sm text-slate-500">Bon retour sur Breezy</p>
      </div>

        {errors.general && (
            <p className="text-sm text-red-500 text-center">{errors.general}</p>
        )}
      <InputField
        label="Email"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="exemple@email.com"
      />
      <InputField
        label="Mot de passe"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="••••••••"
      />

        <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
        </Button>

      <p className="text-sm text-center text-slate-500">
        Pas encore de compte ?{' '}
        <Link href="/register" className="text-[#5B5EF4] font-medium hover:underline">
          S'inscrire
        </Link>
      </p>
    </form>
  )
}
