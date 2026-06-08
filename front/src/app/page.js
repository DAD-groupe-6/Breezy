import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-gray-800 p-4">
      <div className="text-center">
        
        <h1 className="text-6xl font-extrabold text-blue-500 mb-4 tracking-tight drop-shadow-sm animate-pulse">
          Breezy
        </h1>

        <span className="inline-block bg-blue-100 text-blue-800 text-sm font-bold px-4 py-2 rounded-full mb-6 shadow-sm">
          🚧 Site en construction
        </span>

        <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
          Notre équipe configure actuellement les microservices et l'interface. 
        </p>
        
      </div>
    </main>
  );
}
