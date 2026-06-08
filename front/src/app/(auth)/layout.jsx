export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm px-6 py-10 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-8 text-center">
          <span className="text-3xl font-bold text-[#5B5EF4]">Breezy</span>
        </div>
        {children}
      </div>
    </div>
  );
}
