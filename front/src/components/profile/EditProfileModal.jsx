'use client'

import { useState, useEffect, useRef } from 'react'
import api from '@/utils/api'
import { deleteMedia } from '@/utils/media'
import { useTranslation } from '@/hooks/useTranslation'
import Avatar from '@/components/user/Avatar'

const NAME_REGEX = /^[\p{L}\p{N} _-]+$/u

export default function EditProfileModal({ isOpen, onClose, user, onSaved }) {
    const { t } = useTranslation()
    const [pseudo, setPseudo] = useState('')
    const [bio, setBio] = useState('')
    const [avatarFile, setAvatarFile] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        if (user) {
            setPseudo(user.pseudo || '')
            setBio(user.bio || '')
            setAvatarFile(null)
        }
    }, [user, isOpen])

    useEffect(() => {
        if (!avatarFile) {
            setAvatarPreview(null)
            return
        }
        const url = URL.createObjectURL(avatarFile)
        setAvatarPreview(url)
        return () => URL.revokeObjectURL(url)
    }, [avatarFile])

    if (!isOpen) return null

    const trimmedPseudo = pseudo.trim()
    const pseudoValid = trimmedPseudo.length > 0 && NAME_REGEX.test(trimmedPseudo)
    const isValid = pseudoValid

    let validationMessage = null
    if (!pseudoValid && pseudo.length > 0) {
        validationMessage = t('profile.editModal.pseudoInvalid')
    } else if (!pseudoValid) {
        validationMessage = t('profile.editModal.pseudoRequired')
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0]
        if (file && file.type.startsWith('image/')) setAvatarFile(file)
        e.target.value = '' // permet de re-sélectionner le même fichier
    }

    const handleSave = async () => {
        if (!isValid) return
        setSaving(true)
        setError(null)
        try {
            const payload = { pseudo: trimmedPseudo, bio: bio.trim() }
            if (avatarFile) {
                const formData = new FormData()
                formData.append('image', avatarFile)
                const { data: media } = await api.post('/media', formData)
                payload.img_profile = media.url
            }
            const { data } = await api.put(`/user/${user.id_user}`, payload)
            if (avatarFile && user.img_profile) {
                deleteMedia(user.img_profile)
            }
            onSaved?.(data)
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || t('profile.editModal.saveError'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div
                className="w-full max-w-md rounded-2xl p-6"
                style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
            >
                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-title)' }}>
                    {t('profile.editModal.title')}
                </h2>

                <div className="flex flex-col items-center gap-2 mb-4">
                    <Avatar imageUrl={avatarPreview || user?.img_profile || null} size={88} />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm font-semibold cursor-pointer"
                        style={{ color: 'var(--color-text-title)' }}
                    >
                        {t('profile.editModal.changePhoto')}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                    />
                </div>

                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    {t('profile.editModal.pseudoLabel')}
                </label>
                <input
                    type="text"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    className="w-full mb-4 px-3 py-2.5 rounded-xl border text-sm outline-none"
                    style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                    }}
                />

                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    {t('profile.editModal.bioLabel')}
                </label>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full mb-2 px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
                    style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                    }}
                />

                {validationMessage && <p className="text-sm text-rose-500 mb-3">{validationMessage}</p>}
                {error && <p className="text-sm text-rose-500 mb-3">{error}</p>}

                <div className="flex gap-3 justify-end mt-2">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="px-4 py-2 rounded-full border text-sm font-semibold cursor-pointer"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                    >
                        {t('profile.editModal.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !isValid}
                        className="px-4 py-2 rounded-full text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'var(--color-text-title)', color: 'var(--color-bg-surface)' }}
                    >
                        {saving ? t('profile.editModal.saving') : t('profile.editModal.save')}
                    </button>
                </div>
            </div>
        </div>
    )
}