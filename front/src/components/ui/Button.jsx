const variants = {
  primary: 'bg-[#5B5EF4] hover:bg-[#4B4EE4] text-white focus-visible:ring-[#5B5EF4]',
  secondary: 'bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 focus-visible:ring-gray-300',
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
