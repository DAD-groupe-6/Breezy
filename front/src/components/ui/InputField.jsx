export default function InputField({ label, id, type = 'text', value, onChange, error, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:ring-2 focus:ring-[#5B5EF4] focus:border-transparent ${
          error
            ? 'border-red-400 bg-red-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
