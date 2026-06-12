'use client'

import { useState } from 'react'
import Link from 'next/link'
import InputField from '@/components/ui/InputField'
import Button from '@/components/ui/Button'
import { validateLogin } from '@/utils/validation'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useTranslation } from '@/hooks/useTranslation'
import { setToken } from '@/utils/cookie'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useTranslation()

  async function handleSubmit(e) {
    e.preventDefault()
    const newErrors = validateLogin(email, password, t)
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({});

    setLoading(true);
    try{
        const { data } = await axios.post('/api/v1/auth/login', { email, password })
        setToken(data.token)
        router.push('/')
    }catch(err){
        const message = err.response?.data?.message || t('errors.network.login')
        setErrors({ general: message })
    } finally {
        setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{t('auth.login.title')}</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">{t('auth.login.subtitle')}</p>
      </div>

        {errors.general && (
            <p className="text-sm text-red-500 text-center">{errors.general}</p>
        )}
      <InputField
        label={t('auth.login.emailLabel')}
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder={t('auth.login.emailPlaceholder')}
      />
      <InputField
        label={t('auth.login.passwordLabel')}
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder={t('auth.login.passwordPlaceholder')}
      />

        <Button type="submit" fullWidth disabled={loading}>
            {loading ? t('auth.login.submitLoading') : t('auth.login.submit')}
        </Button>

      <p className="text-sm text-center text-[var(--color-text-secondary)]">
        {t('auth.login.noAccount')}{' '}
        <Link href="/register" className="text-[var(--color-text-title)] font-medium hover:underline">
          {t('auth.login.register')}
        </Link>
      </p>
    </form>
  )
}
