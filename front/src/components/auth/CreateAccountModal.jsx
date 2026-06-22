'use client'

import { useEffect, useState } from 'react'
import InputField from '@/components/ui/InputField'
import Button from '@/components/ui/Button'
import { validateRegister } from '@/utils/validation'
import { useTranslation } from '@/hooks/useTranslation'
import api from '@/utils/api'

export default function CreateAccountModal({ isOpen, onClose }) {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [roleId, setRoleId] = useState('')
  const [roles, setRoles] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) onClose?.()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, loading, onClose])

  useEffect(() => {
    if (!isOpen) {
      setUsername('')
      setDisplayName('')
      setRoleId('')
      setRoles([])
      setEmail('')
      setPassword('')
      setConfirm('')
      setErrors({})
      setLoading(false)
      setSuccess('')
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false

    async function loadRoles() {
      try {
        const { data } = await api.get('/auth/roles')
        if (!cancelled) {
          const availableRoles = Array.isArray(data?.roles) ? data.roles : []
          setRoles(availableRoles)
          if (availableRoles.length > 0) {
            setRoleId(String(availableRoles[0].id))
          }
        }
      } catch {
        if (!cancelled) {
          setRoles([])
          setErrors({ general: t('auth.createAccount.rolesLoadError') })
        }
      }
    }

    loadRoles()

    return () => {
      cancelled = true
    }
  }, [isOpen, t])

  async function handleSubmit(e) {
    e.preventDefault()

    const newErrors = validateRegister(username, email, password, confirm, t)
    if (!displayName) {
      newErrors.displayName = t('errors.displayName.required')
    }
    if (!roleId) {
      newErrors.role = t('errors.role.required')
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)
    setSuccess('')

    try {
      await api.post('/auth/register', {
        email,
        password,
        pseudo_uniq: username,
        pseudo: displayName,
        roleId,
      })
      setSuccess(t('auth.createAccount.success'))
    } catch (err) {
      const message = err.response?.data?.message || t('errors.network.register')
      setErrors({ general: message })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={!loading ? onClose : undefined}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('auth.createAccount.title')}
        className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-md)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{t('auth.createAccount.title')}</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">{t('auth.createAccount.subtitle')}</p>
        </div>

        {errors.general && <p className="mb-3 text-sm text-red-500">{errors.general}</p>}
        {success && <p className="mb-3 text-sm text-emerald-600">{success}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <InputField
            label={t('auth.register.usernameLabel')}
            id="create-account-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            placeholder={t('auth.register.usernamePlaceholder')}
          />
          <InputField
            label={t('auth.register.displayNameLabel')}
            id="create-account-display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            error={errors.displayName}
            placeholder={t('auth.register.displayNamePlaceholder')}
          />
          <div className="flex flex-col gap-[var(--space-xs)]">
            <label htmlFor="create-account-role" className="text-sm font-medium text-[var(--color-text-primary)]">
              {t('auth.createAccount.roleLabel')}
            </label>
            <select
              id="create-account-role"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              disabled={loading || roles.length === 0}
              className={`px-[var(--space-sm)] py-[10px] rounded-[var(--radius-md)] border text-sm text-[var(--color-text-primary)] outline-none shadow-[var(--shadow-sm)] transition-[background-color,border-color,box-shadow,color] duration-200 focus:border-[var(--color-text-title)] focus:shadow-[var(--shadow-focus)] ${
                errors.role
                  ? 'border-red-400 bg-red-50/80'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-surface-2)] hover:border-[var(--color-text-secondary)]'
              }`}
            >
              {roles.map((role) => (
                <option key={role.id} value={String(role.id)}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
          </div>
          <InputField
            label={t('auth.register.emailLabel')}
            id="create-account-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder={t('auth.register.emailPlaceholder')}
          />
          <InputField
            label={t('auth.register.passwordLabel')}
            id="create-account-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder={t('auth.register.passwordPlaceholder')}
          />
          <InputField
            label={t('auth.register.confirmLabel')}
            id="create-account-confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={errors.confirm}
            placeholder={t('auth.register.confirmPlaceholder')}
          />

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('auth.createAccount.submitLoading') : t('auth.createAccount.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
