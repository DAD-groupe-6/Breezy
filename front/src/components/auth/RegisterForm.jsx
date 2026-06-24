'use client'

import { useState } from 'react'
import Link from 'next/link'
import InputField from '@/components/ui/InputField'
import Button from '@/components/ui/Button'
import { validateRegister } from '@/utils/validation'
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/providers/AuthProvider';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault()
    const newErrors = validateRegister(username, email, password, confirm, t)
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    setLoading(true);
    try{
        await api.post('/auth/register', {
            email,
            password,
            pseudo_uniq: username,
            pseudo: displayName
        })
        try {
            const { data } = await api.post('/auth/login', { email, password })
            login(data.token)
            router.push('/profil?onboarding=1')
        } catch {
            router.push('/login')
        }
    }catch(err){
        const message = err.response?.data?.message || t('errors.network.register')
        setErrors({ general: message })
    } finally {
        setLoading(false)
    }
  }

  return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="mb-2">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{t('auth.register.title')}</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">{t('auth.register.subtitle')}</p>
          </div>

          {errors.general && (
              <p className="text-sm text-red-500 text-center">{errors.general}</p>
          )}

          <InputField label={t('auth.register.usernameLabel')} id="username" value={username} onChange={(e) => setUsername(e.target.value)} error={errors.username} placeholder={t('auth.register.usernamePlaceholder')} />
          <InputField label={t('auth.register.displayNameLabel')} id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} error={errors.displayName} placeholder={t('auth.register.displayNamePlaceholder')} />
          <InputField label={t('auth.register.emailLabel')} id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder={t('auth.register.emailPlaceholder')} />
          <InputField label={t('auth.register.passwordLabel')} id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} placeholder={t('auth.register.passwordPlaceholder')} />
          <InputField label={t('auth.register.confirmLabel')} id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} placeholder={t('auth.register.confirmPlaceholder')} />

          <Button type="submit" fullWidth disabled={loading}>
              {loading ? t('auth.register.submitLoading') : t('auth.register.submit')}
          </Button>

          <p className="text-sm text-center text-[var(--color-text-secondary)]">
              {t('auth.register.alreadyAccount')}{' '}
              <Link href="/login" className="text-[var(--color-text-title)] font-medium hover:underline">
                  {t('auth.register.login')}
              </Link>
          </p>
      </form>
    )
}
