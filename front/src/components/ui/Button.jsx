const variants = {
  primary: 'border-transparent bg-[var(--color-text-title)] text-[var(--color-bg-surface)] hover:bg-[var(--color-accent-hover)] hover:shadow-[var(--shadow-md)]',
  secondary: 'border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-soft)] hover:shadow-[var(--shadow-sm)]',
}

export default function Button({ children, type = 'button', onClick, disabled = false, variant = 'primary', fullWidth = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-[var(--space-xs)] px-[var(--space-md)] py-[10px] rounded-[var(--radius-pill)] border text-sm font-semibold cursor-pointer shadow-[var(--shadow-sm)] transition-[background-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] active:scale-[0.99] ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed hover:shadow-[var(--shadow-sm)] active:scale-100' : ''}`}
    >
      {children}
    </button>
  )
}
