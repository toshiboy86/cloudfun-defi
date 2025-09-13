interface SpotifyArtistData {
  id: string;
  name: string;
  popularity: number;
  followers: {
    total: number;
  };
  genres: string[];
  external_urls: {
    spotify: string;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
}

interface ArtistProfileProps {
  artist: SpotifyArtistData;
}

export function ArtistProfile({ artist }: ArtistProfileProps) {
  return (
    <div className="space-y-8">
      {/* Artist Image */}
      <div className="aspect-square w-full max-w-md mx-auto lg:mx-0">
        <img
          src={
            artist.images[0]?.url ||
            'https://via.placeholder.com/400x400?text=No+Image'
          }
          alt={artist.name}
          className="w-full h-full object-cover rounded-2xl shadow-lg"
        />
      </div>

      {/* Artist Info */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">{artist.name}</h1>
        <p className="text-xl text-orange-600 font-medium">
          {artist.genres[0] || 'Unknown Genre'}
        </p>
        <p className="text-gray-700 leading-relaxed">
          {artist.name} is a popular artist with{' '}
          {artist.followers.total.toLocaleString()} followers and a popularity
          score of {artist.popularity}/100. Their music spans across{' '}
          {artist.genres.length > 0
            ? artist.genres.join(', ')
            : 'various genres'}
          .
        </p>
      </div>

      {/* Biography */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">About</h2>
        <p className="text-gray-700 leading-relaxed">
          This artist has gained significant recognition in the music industry
          with their unique sound and style. With a strong following of{' '}
          {artist.followers.total.toLocaleString()} fans, they continue to make
          an impact in the {artist.genres[0] || 'music'} scene.
        </p>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">Artist Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Followers</p>
            <p className="text-2xl font-bold text-gray-900">
              {artist.followers.total.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Popularity</p>
            <p className="text-2xl font-bold text-gray-900">
              {artist.popularity}/100
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
