import Link from 'next/link'
import Post from '@/components/Post'

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="sticky top-0 z-40 border-b border-[var(--color-bg-surface-2)] bg-[var(--color-bg-surface)]/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-3 md:py-4">
          <h2 className="text-xl font-bold text-[var(--color-text-title)] md:text-2xl">Accueil</h2>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border border-[var(--color-text-title)] px-5 py-2 text-sm font-semibold text-[var(--color-text-title)] transition-colors duration-200 hover:bg-[var(--color-text-title)] hover:text-white"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[var(--color-text-title)] px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:brightness-95"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-2xl px-0 pb-6 pt-2 sm:px-4">
        <div className="overflow-hidden rounded-2xl border border-[var(--color-bg-surface-2)] bg-[var(--color-bg-surface)] shadow-lg">
          <Post
            displayName="Marie Dupont"
            username="mariedupont"
            timestamp="3h"
            content="Tout le monde s'entend sur le fait que Javascript est à la fois incroyable et horrible 😅"
            likes={234}
            comments={45}
            replies={12}
          />

          <Post
            displayName="Alex Martin"
            username="alexmartin"
            timestamp="1h"
            content="Coucher de soleil magnifique aujourd'hui 🌅"
            image="https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600&h=400&fit=crop"
            likes={1200}
            comments={89}
            replies={34}
          />

          <Post
            displayName="Tech News"
            username="technews"
            timestamp="30m"
            content="Découvrez les nouvelles fonctionnalités de React 19 🚀"
            video="https://videos.pexels.com/video-files/3209754/3209754-hd_1920_1080_24fps.mp4"
            likes={5600}
            comments={340}
            replies={250}
          />
        </div>
      </main>
    </div>
  );
}
