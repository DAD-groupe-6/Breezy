export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] p-4">
      <div className="text-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-8 py-10 shadow-lg">
        <h1 className="mb-4 text-6xl font-extrabold tracking-tight text-[var(--color-text-title)] drop-shadow-sm animate-pulse">
          Breezy
        </h1>

        <span className="mb-6 inline-block rounded-full bg-[var(--color-bg-surface-2)] px-4 py-2 text-sm font-bold text-[var(--color-text-secondary)] shadow-sm">
          🚧 Site en construction
        </span>

        <p className="mx-auto max-w-md text-lg leading-relaxed text-[var(--color-text-secondary)]">
          Notre équipe configure actuellement les microservices et l'interface.
        </p>
      </div>
    </main>
  );
}
