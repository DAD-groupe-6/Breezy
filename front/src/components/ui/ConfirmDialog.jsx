'use client';

// Modale de confirmation générique.
// Props : isOpen, title, message, confirmLabel, cancelLabel, onConfirm, onClose,
//         loading (désactive les boutons), danger (bouton de confirmation rouge).
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
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => { if (!loading) onClose?.(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-[var(--space-lg)] shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-[length:var(--font-size-lg)] font-[var(--font-weight-bold)] text-[var(--color-text-primary)]">
            {title}
          </h2>
        )}
        {message && (
          <p className="mt-[var(--space-xs)] text-sm text-[var(--color-text-secondary)]">
            {message}
          </p>
        )}

        <div className="mt-[var(--space-lg)] flex justify-end gap-[var(--space-sm)]">
          <button
            type="button"
            onClick={() => onClose?.()}
            disabled={loading}
            className="rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-[var(--space-md)] py-2 text-sm font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-surface-2)] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm?.()}
            disabled={loading}
            className={`rounded-[var(--radius-pill)] border border-transparent px-[var(--space-md)] py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
              danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[var(--color-text-title)] hover:bg-[var(--color-accent-hover)]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
