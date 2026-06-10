import ProfileHeader from '@/components/profil/ProfileHeader';
import Post from '@/components/Post';

const MOCK_USER = {
  displayName: 'Lucas Martin',
  username: 'lucas_m',
  bio: 'Développeur passionné ☁️ | Amoureux du café et des bons commits | En train de construire des trucs cool chez @Breezy',
  imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  postsCount: 248,
  followersCount: 1340,
  followingCount: 312,
  location: 'Paris, France',
  joinedDate: 'janvier 2023',
};

const MOCK_POSTS = [
  {
    id: 1,
    displayName: 'Lucas Martin',
    username: 'lucas_m',
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    timestamp: '2h',
    content: "Je viens de déployer ma première app Next.js en prod 🚀 C'est une fierté incroyable. Merci à toute l'équipe !",
    likes: 87,
    comments: 14,
    replies: 5,
  },
  {
    id: 2,
    displayName: 'Lucas Martin',
    username: 'lucas_m',
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    timestamp: '1j',
    content: "Le CSS c'est de l'art. Vous ne me convaincrez jamais du contraire. 🎨\n\n(dit celui qui passe 3h à centrer une div)",
    likes: 204,
    comments: 32,
    replies: 18,
  },
  {
    id: 3,
    displayName: 'Lucas Martin',
    username: 'lucas_m',
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    timestamp: '3j',
    content: "Hot take : les microservices c'est fantastique jusqu'au moment où vous devez les déboguer à 2h du matin.",
    likes: 511,
    comments: 67,
    replies: 43,
  },
  {
    id: 4,
    displayName: 'Lucas Martin',
    username: 'lucas_m',
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    timestamp: '1 sem',
    content: 'Petite question : vous préférez travailler en remote complet, hybride ou full présentiel ? (je collecte des données non-représentatives)',
    likes: 138,
    comments: 89,
    replies: 12,
  },
  {
    id: 5,
    displayName: 'Lucas Martin',
    username: 'lucas_m',
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    timestamp: '2 sem',
    content: 'Premier commit de 2026 ✅\nDernier commit de 2026 : probablement "fix typo" à 23h58.',
    likes: 760,
    comments: 45,
    replies: 30,
  },
];

export default function ProfilPage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-light-bg-primary)' }}
    >
      <div
        className="md:max-w-2xl md:mx-auto md:my-4 md:rounded-2xl md:shadow-sm overflow-hidden"
        style={{ backgroundColor: 'white', border: '1px solid var(--color-light-border)' }}
      >
        {/* Header de profil */}
        <ProfileHeader {...MOCK_USER} isOwnProfile={true} />

        {/* Titre section publications */}
        <div className="px-4 py-4">
          <h2
            className="text-lg font-bold"
            style={{ color: 'var(--color-light-text-primary)' }}
          >
            Posts
          </h2>
        </div>

        {/* Feed de posts */}
        <div>
          {MOCK_POSTS.map((post) => (
            <Post key={post.id} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
}

