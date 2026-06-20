'use client'

import { useEffect } from 'react'

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onClose,
    loading = false,
    danger = false,
}) {
    useEffect(() => {
        if (!isOpen) return
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                className="w-full max-w-sm rounded-2xl p-6"
                style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-title)' }}>
                        {title}
                    </h2>
                )}
                {message && (
                    <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                        {message}
                    </p>
                )}

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 rounded-full border text-sm font-semibold cursor-pointer disabled:opacity-50"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                            danger ? 'bg-rose-600 text-white hover:bg-rose-700 transition-colors' : ''
                        }`}
                        style={
                            danger
                                ? undefined
                                : { backgroundColor: 'var(--color-text-title)', color: 'var(--color-bg-surface)' }
                        }
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
