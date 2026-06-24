'use client'

import { useEffect, useState } from 'react'
import { FiTrash2, FiPlus } from 'react-icons/fi'
import api from '@/utils/api'
import { useTranslation } from '@/hooks/useTranslation'
import { useToast } from '@/hooks/useToast'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

// Rôles "noyau" : la suppression/renommage est bloquée côté serveur. Ici on grise juste l'UI.
const CORE_ROLES = ['visiteur', 'utilisateur', 'moderateur', 'administrateur']

const errMessage = (err, fallback) => err?.response?.data?.message || fallback

const inputClass =
    'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-text-title)]'

function RoleCard({ role, permissions, onChange }) {
    const { t } = useTranslation()
    const toast = useToast()
    const isCore = CORE_ROLES.includes(role.name)

    const [name, setName] = useState(role.name)
    const [description, setDescription] = useState(role.description || '')
    const [selected, setSelected] = useState(() => new Set((role.permissions || []).map((p) => p.name)))
    const [saving, setSaving] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Resynchronise l'état local quand les données rechargent (nouvel objet role après save).
    useEffect(() => {
        setName(role.name)
        setDescription(role.description || '')
        setSelected(new Set((role.permissions || []).map((p) => p.name)))
    }, [role])

    const togglePermission = (permName) => {
        setSelected((prev) => {
            const next = new Set(prev)
            next.has(permName) ? next.delete(permName) : next.add(permName)
            return next
        })
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await api.put(`/auth/admin/roles/${role.id}`, {
                name: name.trim(),
                description,
                permissions: [...selected],
            })
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
            await api.delete(`/auth/admin/roles/${role.id}`)
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
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface-2)] p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                    <label className="mb-1 block text-xs text-[var(--color-text-secondary)]">{t('pages.admin.roleName')}</label>
                    <input
                        className={inputClass}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isCore}
                    />
                </div>
                <div className="flex-1">
                    <label className="mb-1 block text-xs text-[var(--color-text-secondary)]">{t('pages.admin.roleDescription')}</label>
                    <input
                        className={inputClass}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('pages.admin.descriptionPlaceholder')}
                    />
                </div>
            </div>

            {isCore && (
                <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{t('pages.admin.coreRoleHint')}</p>
            )}

            <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    {t('pages.admin.permissionsLabel')}
                </p>
                {permissions.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-secondary)]">{t('pages.admin.noPermissions')}</p>
                ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {permissions.map((perm) => (
                            <label
                                key={perm.id}
                                className="flex cursor-pointer items-start gap-2 rounded-lg border border-transparent px-2 py-1 hover:border-[var(--color-border)]"
                                title={perm.description || ''}
                            >
                                <input
                                    type="checkbox"
                                    className="mt-0.5 accent-[var(--color-text-title)]"
                                    checked={selected.has(perm.name)}
                                    onChange={() => togglePermission(perm.name)}
                                />
                                <span className="min-w-0">
                                    <span className="block truncate text-sm text-[var(--color-text-primary)]">{perm.name}</span>
                                    {perm.description && (
                                        <span className="block truncate text-xs text-[var(--color-text-secondary)]">{perm.description}</span>
                                    )}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
                <Button onClick={handleSave} disabled={saving || !name.trim()}>
                    {saving ? t('pages.admin.saving') : t('pages.admin.save')}
                </Button>
                {!isCore && (
                    <button
                        type="button"
                        onClick={() => setConfirmOpen(true)}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-rose-500 transition-colors hover:bg-rose-500/10"
                    >
                        <FiTrash2 size={16} />
                        {t('pages.admin.delete')}
                    </button>
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmOpen}
                title={t('pages.admin.deleteRoleConfirm.title')}
                message={t('pages.admin.deleteRoleConfirm.message')}
                confirmLabel={t('pages.admin.deleteRoleConfirm.confirm')}
                cancelLabel={t('pages.admin.deleteRoleConfirm.cancel')}
                onConfirm={handleDelete}
                onClose={() => { if (!deleting) setConfirmOpen(false) }}
                loading={deleting}
                danger
            />
        </div>
    )
}

export default function RolesPanel({ roles, permissions, onChange }) {
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
            await api.post('/auth/admin/roles', { name: newName.trim(), description: newDescription })
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
                {t('pages.admin.rolesTitle')}
            </h2>

            <div className="flex flex-col gap-4">
                {roles.map((role) => (
                    <RoleCard key={role.id} role={role} permissions={permissions} onChange={onChange} />
                ))}
            </div>

            <div className="mt-5 rounded-xl border border-dashed border-[var(--color-border)] p-4">
                <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">{t('pages.admin.newRole')}</p>
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
