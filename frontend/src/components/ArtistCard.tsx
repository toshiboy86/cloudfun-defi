interface ArtistCardProps {
  id: string;
  name: string;
  status: 'active' | 'no-pool';
  genre: string;
  followers: string;
  popularity: number;
  lpTokens: string;
  lpBalance: string;
  buttonText: string;
  imageUrl: string;
}

import Link from 'next/link';

export function ArtistCard({
  id,
  name,
  status,
  genre,
  followers,
  popularity,
  lpTokens,
  lpBalance,
  buttonText,
  imageUrl,
}: ArtistCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Artist Image */}
      <div className="relative h-48 overflow-hidden">
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      </div>

      {/* Artist Info */}
      <div className="p-6">
        {/* Status and Name */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">{name}</h3>
          <div className="flex items-center space-x-1">
            {status === 'active' ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">
                  Funding Active
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-500 font-medium">
                  No Pool
                </span>
              </>
            )}
          </div>
        </div>

        {/* Genre */}
        {/* <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
            {genre}
          </span>
        </div> */}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">LP Tokens</p>
            <p className="text-lg font-semibold text-gray-900">{lpTokens}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">LP Balance</p>
            <p className="text-lg font-semibold text-gray-900">{lpBalance}</p>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/artist/${id}`}
          className={`block w-full font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-center ${
            status === 'active'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
          }`}
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}
