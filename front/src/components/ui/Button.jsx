const variants = {
  primary: 'bg-[var(--color-text-title)] hover:opacity-90 text-[var(--color-bg-surface)] focus-visible:ring-[var(--color-text-title)]',
  secondary: 'bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-surface-2)] text-[var(--color-text-primary)] border border-[var(--color-border)] focus-visible:ring-[var(--color-border)]',
}

export default function Button({ children, type = 'button', onClick, disabled = false, variant = 'primary', fullWidth = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}
