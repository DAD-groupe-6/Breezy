'use client'

export default function SettingsCard({ title, description, children }) {
    return (
        <div
            className="w-full rounded-2xl border p-6"
            style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
            }}
        >
            <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                {title}
            </h2>
            {description && (
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    {description}
                </p>
            )}
            {children}
        </div>
    )
}