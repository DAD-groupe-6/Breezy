'use client'

import { useEffect, useState } from 'react'
import { FiTrash2, FiPlus } from 'react-icons/fi'
import api from '@/utils/api'
import { useTranslation } from '@/hooks/useTranslation'
import { useToast } from '@/hooks/useToast'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

// Permission protégée : la supprimer/renommer verrouillerait l'accès à cette page (bloqué serveur).
const PROTECTED = ['manage_roles']

const errMessage = (err, fallback) => err?.response?.data?.message || fallback

const inputClass =
    'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-text-title)]'

function PermissionRow({ permission, onChange }) {
    const { t } = useTranslation()
    const toast = useToast()
    const isProtected = PROTECTED.includes(permission.name)

    const [name, setName] = useState(permission.name)
    const [description, setDescription] = useState(permission.description || '')
    const [saving, setSaving] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        setName(permission.name)
        setDescription(permission.description || '')
    }, [permission])

    const handleSave = async () => {
        setSaving(true)
        try {
            await api.put(`/auth/admin/permissions/${permission.id}`, { name: name.trim(), description })
            toast.success(t('pages.admin.saved'))
            onChange()
        } catch (err) {
            toast.error(errMessage(err, t('pages.admin.genericError')))
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await api.delete(`/auth/admin/permissions/${permission.id}`)
            toast.success(t('pages.admin.deleted'))
            setConfirmOpen(false)
            onChange()
        } catch (err) {
            toast.error(errMessage(err, t('pages.admin.genericError')))
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] p-3 sm:flex-row sm:items-end">
            <div className="flex-1">
                <label className="mb-1 block text-xs text-[var(--color-text-secondary)]">{t('pages.admin.permissionName')}</label>
                <input
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isProtected}
                />
            </div>
            <div className="flex-1">
                <label className="mb-1 block text-xs text-[var(--color-text-secondary)]">{t('pages.admin.permissionDescription')}</label>
                <input
                    className={inputClass}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('pages.admin.descriptionPlaceholder')}
                />
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={handleSave} disabled={saving || !name.trim()}>
                    {saving ? t('pages.admin.saving') : t('pages.admin.save')}
                </Button>
                {!isProtected && (
                    <button
                        type="button"
                        onClick={() => setConfirmOpen(true)}
                        aria-label={t('pages.admin.delete')}
                        className="inline-flex items-center justify-center rounded-full p-2 text-rose-500 transition-colors hover:bg-rose-500/10"
                    >
                        <FiTrash2 size={16} />
                    </button>
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmOpen}
                title={t('pages.admin.deletePermissionConfirm.title')}
                message={t('pages.admin.deletePermissionConfirm.message')}
                confirmLabel={t('pages.admin.deletePermissionConfirm.confirm')}
                cancelLabel={t('pages.admin.deletePermissionConfirm.cancel')}
                onConfirm={handleDelete}
                onClose={() => { if (!deleting) setConfirmOpen(false) }}
                loading={deleting}
                danger
            />
        </div>
    )
}

export default function PermissionsPanel({ permissions, onChange }) {
    const { t } = useTranslation()
    const toast = useToast()
    const [newName, setNewName] = useState('')
    const [newDescription, setNewDescription] = useState('')
    const [creating, setCreating] = useState(false)

    const handleCreate = async () => {
        if (!newName.trim()) {
            toast.error(t('pages.admin.nameRequired'))
            return
        }
        setCreating(true)
        try {
            await api.post('/auth/admin/permissions', { name: newName.trim(), description: newDescription })
            toast.success(t('pages.admin.created'))
            setNewName('')
            setNewDescription('')
            onChange()
        } catch (err) {
            toast.error(errMessage(err, t('pages.admin.genericError')))
        } finally {
            setCreating(false)
        }
    }

    return (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
            <h2 className="mb-4 text-lg text-[var(--color-text-title)] [font-weight:var(--font-weight-display)]">
                {t('pages.admin.permissionsTitle')}
            </h2>

            <div className="flex flex-col gap-3">
                {permissions.map((permission) => (
                    <PermissionRow key={permission.id} permission={permission} onChange={onChange} />
                ))}
            </div>

            <div className="mt-5 rounded-xl border border-dashed border-[var(--color-border)] p-4">
                <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">{t('pages.admin.newPermission')}</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        className={inputClass}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder={t('pages.admin.namePlaceholder')}
                    />
                    <input
                        className={inputClass}
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder={t('pages.admin.descriptionPlaceholder')}
                    />
                    <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
                        <FiPlus size={16} />
                        {creating ? t('pages.admin.creating') : t('pages.admin.create')}
                    </Button>
                </div>
            </div>
        </section>
    )
}
