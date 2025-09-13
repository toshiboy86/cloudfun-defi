'use client';

import { HeroSection } from '../../components/HeroSection';
import { ArtistCard } from '../../components/ArtistCard';
import { useState, useEffect } from 'react';
import { useSpotify } from '../../contexts/SpotifyContext';

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

interface FollowedArtistsResponse {
  success: boolean;
  data?: SpotifyArtistData[];
  error?: string;
  timestamp: string;
  total?: number;
  fallback?: boolean;
}

interface ArtistWithFunding {
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

export default function ListPage() {
  const [artists, setArtists] = useState<ArtistWithFunding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const { accessToken, isConnected } = useSpotify();

  useEffect(() => {
    const fetchFollowedArtists = async () => {
      if (!isConnected || !accessToken) {
        setError('Please connect your Spotify account first');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch followed artists from Spotify
        const response = await fetch(
          `/api/spotify/followed-artists?access_token=${accessToken}&limit=20`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || 'Failed to fetch followed artists'
          );
        }

        const followedArtistsData: FollowedArtistsResponse =
          await response.json();

        if (!followedArtistsData.success || !followedArtistsData.data) {
          throw new Error('No followed artists data received');
        }

        // Check if this is fallback data
        setIsFallback(followedArtistsData.fallback || false);

        // Process the followed artists data
        const artistData: ArtistWithFunding[] = followedArtistsData.data.map(
          (spotifyData) => {
            // Mock funding data - in a real app, this would come from your smart contracts
            const mockFundingData = {
              status:
                Math.random() > 0.5
                  ? 'active'
                  : ('no-pool' as 'active' | 'no-pool'),
              lpTokens: (Math.random() * 200).toFixed(2),
              lpBalance: `$${(Math.random() * 5000).toFixed(2)}`,
            };

            return {
              id: spotifyData.id,
              name: spotifyData.name,
              status: mockFundingData.status,
              genre: spotifyData.genres[0] || 'Unknown',
              followers: spotifyData.followers.total.toLocaleString(),
              popularity: spotifyData.popularity,
              lpTokens: mockFundingData.lpTokens,
              lpBalance: mockFundingData.lpBalance,
              buttonText:
                mockFundingData.status === 'active'
                  ? 'View Investment'
                  : 'Fund Artist',
              imageUrl:
                spotifyData.images[0]?.url ||
                'https://via.placeholder.com/400x300?text=No+Image',
            };
          }
        );

        if (artistData.length === 0) {
          setError('You are not following any artists on Spotify');
        } else {
          setArtists(artistData);
        }
      } catch (err) {
        console.error('Error fetching followed artists:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load followed artists'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFollowedArtists();
  }, [accessToken, isConnected]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeroSection />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-600">
                Loading your followed artists from Spotify...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeroSection />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to load followed artists
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />

      {/* Fallback Notice */}
      {isFallback && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Note:</strong> Your Spotify account doesn't have
                  permission to read followed artists. Showing popular artists
                  instead. To see your followed artists, please reconnect your
                  Spotify account with the required permissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Artist Cards Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              id={artist.id}
              name={artist.name}
              status={artist.status}
              genre={artist.genre}
              followers={artist.followers}
              popularity={artist.popularity}
              lpTokens={artist.lpTokens}
              lpBalance={artist.lpBalance}
              buttonText={artist.buttonText}
              imageUrl={artist.imageUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
