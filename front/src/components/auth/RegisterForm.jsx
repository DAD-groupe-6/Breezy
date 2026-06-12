'use client'

import { useState } from 'react'
import Link from 'next/link'
import InputField from '@/components/ui/InputField'
import Button from '@/components/ui/Button'
import { validateRegister } from '@/utils/validation'
import {useRouter} from "next/navigation";
import axios from "axios";

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault()
    const newErrors = validateRegister(username, email, password, confirm)
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    setLoading(true);
    try{
        await axios.post('/api/v1/auth/register', {
            email,
            password,
            pseudo_uniq: username,
            pseudo: displayName
        })
        router.push('/login')
    }catch(err){
        const message = err.response?.data?.message || 'Erreur réseau, réessayez plus tard'
        setErrors({ general: message })
    } finally {
        setLoading(false)
    }
  }

  return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="mb-2">
              <h2 className="text-xl font-bold text-slate-900">Créer un compte</h2>
              <p className="text-sm text-slate-500">Rejoins Breezy dès maintenant</p>
          </div>

          {errors.general && (
              <p className="text-sm text-red-500 text-center">{errors.general}</p>
          )}

          <InputField label="Nom d'utilisateur" id="username" value={username} onChange={(e) => setUsername(e.target.value)} error={errors.username} placeholder="@tonpseudo" />
          <InputField label="Nom d'affichage" id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} error={errors.displayName} placeholder="Ton nom complet" />
          <InputField label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="exemple@email.com" />
          <InputField label="Mot de passe" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} placeholder="Minimum 8 caractères" />
          <InputField label="Confirmer le mot de passe" id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} placeholder="••••••••" />

          <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Création...' : 'Créer mon compte'}
          </Button>

          <p className="text-sm text-center text-slate-500">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-[#5B5EF4] font-medium hover:underline">
                  Se connecter
              </Link>
          </p>
      </form>
    )
}
