export default function InputField({ label, id, type = 'text', value, onChange, error, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-[var(--color-text-primary)]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`px-3 py-2.5 rounded-xl border text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] outline-none transition-colors focus:ring-2 focus:ring-[var(--color-text-title)] focus:border-transparent ${
          error
            ? 'border-red-400 bg-red-50'
            : 'border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:border-[var(--color-text-secondary)]'
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
