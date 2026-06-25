'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { useTranslation } from '@/hooks/useTranslation'
import { useToast } from '@/hooks/useToast'
import api from '@/utils/api'
import RolesPanel from '@/components/admin/RolesPanel'
import PermissionsPanel from '@/components/admin/PermissionsPanel'

export default function AdminPage() {
    const router = useRouter()
    const { t } = useTranslation()
    const toast = useToast()
    const { hasPermission, permsLoaded } = useAuth()

    const [roles, setRoles] = useState([])
    const [permissions, setPermissions] = useState([])
    const [loading, setLoading] = useState(true)

    const allowed = permsLoaded && hasPermission('manage_roles')

    // Accès réservé : on renvoie vers 403 dès que l'on sait que la permission manque.
    useEffect(() => {
        if (permsLoaded && !hasPermission('manage_roles')) router.replace('/403')
    }, [permsLoaded, hasPermission, router])

    // Recharge la photo complète (rôles + permissions) depuis Auth, source de vérité.
    // Fonction simple (non mémoïsée) : elle n'est appelée que par l'effet de chargement
    // et par les handlers des panneaux — aucun effet n'en dépend, donc pas de boucle.
    const reload = async () => {
        try {
            const [rolesRes, permsRes] = await Promise.all([
                api.get('/auth/admin/roles'),
                api.get('/auth/admin/permissions'),
            ])
            setRoles(rolesRes.data?.roles || [])
            setPermissions(permsRes.data?.permissions || [])
        } catch {
            toast.error(t('pages.admin.loadError'))
        } finally {
            setLoading(false)
        }
    }

    // Chargement initial : se déclenche une seule fois, quand l'accès est confirmé.
    const loadedRef = useRef(false)
    useEffect(() => {
        if (allowed && !loadedRef.current) {
            loadedRef.current = true
            reload()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allowed])

    if (!permsLoaded || !hasPermission('manage_roles')) return null

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] px-4 py-8">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
                <header>
                    <h1 className="text-2xl text-[var(--color-text-title)] [font-weight:var(--font-weight-display)] [letter-spacing:var(--tracking-display)]">
                        {t('pages.admin.title')}
                    </h1>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t('pages.admin.subtitle')}</p>
                </header>

                {loading ? (
                    <p className="text-[var(--color-text-secondary)]">{t('pages.admin.loading')}</p>
                ) : (
                    <>
                        <RolesPanel roles={roles} permissions={permissions} onChange={reload} />
                        <PermissionsPanel permissions={permissions} />
                    </>
                )}
            </div>
        </div>
    )
}
