import Post from "@/components/Post";

export default function Home() {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="sticky top-0 bg-white/80 border-b border-gray-100 px-4 py-3 md:py-4 z-40 backdrop-blur-sm">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900">Accueil</h2>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full bg-slate-50">
        {/* Post avec message classique */}
        <Post
          displayName="Marie Dupont"
          username="mariedupont"
          timestamp="3h"
          content="Tout le monde s'entend sur le fait que Javascript est à la fois incroyable et horrible 😅"
          likes={234}
          comments={45}
          replies={12}
        />

        {/* Post avec image */}
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

        {/* Post avec vidéo */}
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
      </main>
    </div>
  );
}
