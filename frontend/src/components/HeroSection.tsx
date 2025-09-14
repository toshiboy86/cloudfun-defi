export function HeroSection() {
  return (
    <div className="relative h-96 bg-gradient-to-br from-orange-400 via-pink-500 to-orange-600 overflow-hidden">
      {/* Background Image Elements */}
      <div className="absolute inset-0">
        {/* Palm trees silhouette */}
        <div className="absolute bottom-0 left-10 w-20 h-32 bg-black opacity-20 rounded-t-full"></div>
        <div className="absolute bottom-0 left-16 w-16 h-28 bg-black opacity-20 rounded-t-full"></div>
        <div className="absolute bottom-0 right-20 w-18 h-30 bg-black opacity-20 rounded-t-full"></div>

        {/* Water silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-800 to-transparent opacity-30"></div>

        {/* Mountains silhouette */}
        <div className="absolute bottom-16 left-0 right-0 h-20 bg-gradient-to-t from-gray-800 to-transparent opacity-40"></div>

        {/* Beach furniture silhouettes */}
        <div className="absolute bottom-8 right-32 w-8 h-8 bg-black opacity-20 rounded-full"></div>
        <div className="absolute bottom-6 right-28 w-6 h-6 bg-black opacity-20"></div>
        <div className="absolute bottom-6 right-36 w-6 h-6 bg-black opacity-20"></div>

        {/* Camel silhouette */}
        <div className="absolute bottom-12 right-48 w-12 h-8 bg-black opacity-20 rounded-full"></div>
        <div className="absolute bottom-10 right-46 w-2 h-6 bg-black opacity-20"></div>
        <div className="absolute bottom-10 right-50 w-2 h-6 bg-black opacity-20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Discover Artists from Your{' '}
          <span className="text-orange-300">Spotify Playlists</span>
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl">
          Support your favorite musicians and share in their success through
          decentralized crowdfunding.
        </p>
      </div>
    </div>
  );
}
