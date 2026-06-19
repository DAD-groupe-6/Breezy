export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-sm px-6 py-10 bg-[var(--color-bg-surface)] rounded-2xl shadow-sm border border-[var(--color-border)]">
        <div className="mb-8 text-center">
          <span className="text-3xl font-bold text-[var(--color-text-title)]">Breezy</span>
        </div>
        {children}
      </div>
    </div>
  );
}
