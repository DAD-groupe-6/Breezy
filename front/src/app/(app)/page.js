import Link from 'next/link'
import Post from '@/components/Post'
import { FaArrowRightToBracket, FaUserPen } from 'react-icons/fa6'

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/95 backdrop-blur">
        <div className="flex w-full items-center px-4 py-3">
          <h1 className="text-lg font-bold text-[var(--color-text-title)]">Accueil</h1>
          <div className="ml-auto flex flex-row items-center gap-2">
            <Link
              href="/login"
              aria-label="Se connecter"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-text-title)] text-[var(--color-text-title)] hover:bg-[var(--color-text-title)] hover:text-[var(--color-bg-surface)] transition-colors duration-200 sm:h-auto sm:w-auto sm:px-4 sm:py-2 sm:text-sm sm:font-semibold"
            >
              <FaArrowRightToBracket className="text-sm sm:hidden" aria-hidden="true" />
              <span className="hidden sm:inline">Se connecter</span>
            </Link>
            <Link
              href="/register"
              aria-label="S'inscrire"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-text-title)] text-[var(--color-bg-surface)] hover:opacity-90 transition-opacity duration-200 sm:h-auto sm:w-auto sm:px-4 sm:py-2 sm:text-sm sm:font-semibold"
            >
              <FaUserPen className="text-sm sm:hidden" aria-hidden="true" />
              <span className="hidden sm:inline">S'inscrire</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-3xl px-4 py-4">
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          
          {/* POST 1 : Marie Dupont */}
          <Post
            displayName="Marie Dupont"
            username="maried"
            imageUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&q=80&auto=format&fit=crop"
            timestamp="2h"
            content="Nouvelle maquette terminée pour Breezy. Hâte de vous montrer la prochaine version."
            likes={128}
            comments={24}
            replies={8}
            initialComments={[
              {
                id: 1,
                displayName: 'Sophie Laurent',
                username: 'sophiel',
                timestamp: '2h',
                content: "Je suis d'accord, c'est un amour-haine permanent 😄",
              },
              {
                id: 2,
                displayName: 'Nicolas Perez',
                username: 'nicolasp',
                timestamp: '1h',
                content: 'Mais quand ca marche, quel plaisir.',
              },
            ]}
          />

          {/* POST 2 : Alex Martin */}
          <Post
            displayName="Alex Martin"
            username="alexm"
            imageUrl="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&q=80&auto=format&fit=crop"
            timestamp="5h"
            content="Petit café + grosse session de dev. Qui d'autre code mieux le matin ?"
            image="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80&auto=format&fit=crop"
            likes={342}
            comments={45}
            replies={12}
            initialComments={[
              {
                id: 3,
                displayName: 'Camille Rouge',
                username: 'camrouge',
                timestamp: '52m',
                content: 'La photo est incroyable.',
              },
            ]}
          />

          {/* POST 3 : Tech News */}
          <Post
            displayName="Tech News"
            username="technews"
            imageUrl="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&q=80&auto=format&fit=crop"
            timestamp="1j"
            content="Démo produit du jour : nouvelle interface plus rapide et plus lisible."
            video="https://videos.pexels.com/video-files/6963744/6963744-sd_640_360_25fps.mp4"
            likes={1200}
            comments={340}
            replies={96}
            initialComments={[
              {
                id: 4,
                displayName: 'Dev Club',
                username: 'devclub',
                timestamp: '20m',
                content: 'Hate de tester ca en prod.',
              },
            ]}
          />
          
        </div>
      </section>
    </main>
  );
}