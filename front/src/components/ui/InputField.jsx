export default function InputField({ label, id, type = 'text', value, onChange, error, placeholder }) {
  return (
    <div className="flex flex-col gap-[var(--space-xs)]">
      <label htmlFor={id} className="text-sm font-medium text-[var(--color-text-primary)]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`px-[var(--space-sm)] py-[10px] rounded-[var(--radius-md)] border text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] outline-none shadow-[var(--shadow-sm)] transition-[background-color,border-color,box-shadow,color] duration-200 focus:border-[var(--color-text-title)] focus:shadow-[var(--shadow-focus)] ${
          error
<<<<<<< HEAD
            ? 'border-red-400 bg-red-50/80'
            : 'border-[var(--color-border)] bg-[var(--color-bg-surface-2)] hover:border-[var(--color-text-secondary)]'
=======
            ? 'border-red-400 bg-red-50'
            : 'border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:border-[var(--color-text-secondary)]'
>>>>>>> origin/dev
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
