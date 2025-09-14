export function HeroSection() {
  return (
    <div className="relative h-96 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/hero.jpg)',
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30"></div>

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
