'use client';

import { HeroSection } from '../../components/HeroSection';
import { ArtistCard } from '../../components/ArtistCard';
import { useState, useEffect } from 'react';
import { useSpotify } from '../../contexts/SpotifyContext';
import { useFanVestFactory } from '../../hooks/useFanVestFactory';
import { useFanVestPool } from '../../hooks/useFanVestPool';
import { weiToUsdc } from '../../lib/currency';

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
  poolAddress?: string;
}

export default function ListPage() {
  const [artists, setArtists] = useState<ArtistWithFunding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [poolStatuses, setPoolStatuses] = useState<Record<string, 'active' | 'no-pool'>>({});
  const [poolAddresses, setPoolAddresses] = useState<Record<string, string>>({});
  const [poolData, setPoolData] = useState<Record<string, { lpTokens: string; lpBalance: string }>>({});
  const { accessToken, isConnected } = useSpotify();
  const { hasPool, getPoolInfo, isLoading: contractLoading } = useFanVestFactory();
  const { getPoolInfo: getPoolDetails } = useFanVestPool();

  // Function to check pool status and get pool data for all artists
  const checkPoolStatuses = async (artistIds: string[]) => {
    const statuses: Record<string, 'active' | 'no-pool'> = {};
    const addresses: Record<string, string> = {};
    const poolInfo: Record<string, { lpTokens: string; lpBalance: string }> = {};
    
    for (const artistId of artistIds) {
      try {
        // Check if pool exists
        const poolExists = await hasPool(artistId);
        statuses[artistId] = poolExists ? 'active' : 'no-pool';
        
        if (poolExists) {
          // Get pool info from factory
          const poolInfoData = await getPoolInfo(artistId);
          addresses[artistId] = poolInfoData.poolAddress;
          
          // Get detailed pool data from pool contract
          if (poolInfoData.poolAddress && poolInfoData.poolAddress !== '0x0000000000000000000000000000000000000000') {
            try {
              const poolDetails = await getPoolDetails(poolInfoData.poolAddress);
                console.log("yougot ", poolDetails.totalSupplyAmount)
                // Convert bigint values to formatted strings
                const totalSupply = weiToUsdc(poolDetails.totalSupplyAmount);
                const totalUSDC = weiToUsdc(poolDetails.totalUSDCAmount);
              
              poolInfo[artistId] = {
                lpTokens: totalSupply.toFixed(2),
                lpBalance: `$${totalUSDC.toFixed(2)}`,
              };
            } catch (poolErr) {
              console.error(`Error getting pool details for artist ${artistId}:`, poolErr);
              // Fallback to mock data if pool details fail
              poolInfo[artistId] = {
                lpTokens: '0.00',
                lpBalance: '$0.00',
              };
            }
          }
        } else {
          // No pool exists, use default values
          poolInfo[artistId] = {
            lpTokens: '0.00',
            lpBalance: '$0.00',
          };
        }
      } catch (err) {
        console.error(`Error checking pool for artist ${artistId}:`, err);
        statuses[artistId] = 'no-pool'; // Default to no-pool on error
        poolInfo[artistId] = {
          lpTokens: '0.00',
          lpBalance: '$0.00',
        };
      }
    }
    
    setPoolStatuses(statuses);
    setPoolAddresses(addresses);
    setPoolData(poolInfo);
    
    console.log('Pool statuses updated:', statuses);
    console.log('Pool addresses updated:', addresses);
    console.log('Pool data updated:', poolInfo);
  };

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
            // Get pool status from contract (will be updated after contract calls)
            const poolStatus = poolStatuses[spotifyData.id] || 'no-pool';
            const poolAddress = poolAddresses[spotifyData.id] || undefined;
            
            // Get real pool data or use defaults
            const poolInfo = poolData[spotifyData.id] || {
              lpTokens: '0.00',
              lpBalance: '$0.00',
            };

            return {
              id: spotifyData.id,
              name: spotifyData.name,
              status: poolStatus,
              genre: spotifyData.genres[0] || 'Unknown',
              followers: spotifyData.followers.total.toLocaleString(),
              popularity: spotifyData.popularity,
              lpTokens: poolInfo.lpTokens,
              lpBalance: poolInfo.lpBalance,
              buttonText:
                poolStatus === 'active'
                  ? 'View Investment'
                  : 'Fund Artist',
              imageUrl:
                spotifyData.images[0]?.url ||
                'https://via.placeholder.com/400x300?text=No+Image',
              poolAddress,
            };
          }
        );

        if (artistData.length === 0) {
          setError('You are not following any artists on Spotify');
        } else {
          setArtists(artistData);
          // Check pool statuses for all artists
          const artistIds = artistData.map(artist => artist.id);
          checkPoolStatuses(artistIds);
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

  // Update artists when pool statuses and data change
  useEffect(() => {
    if (artists.length > 0 && Object.keys(poolStatuses).length > 0) {
      setArtists(prevArtists => 
        prevArtists.map(artist => {
          const poolStatus = poolStatuses[artist.id] || 'no-pool';
          const poolInfo = poolData[artist.id] || { lpTokens: '0.00', lpBalance: '$0.00' };
          const poolAddress = poolAddresses[artist.id] || undefined;
          
          return {
            ...artist,
            status: poolStatus,
            buttonText: poolStatus === 'active' ? 'View Investment' : 'Fund Artist',
            lpTokens: poolInfo.lpTokens,
            lpBalance: poolInfo.lpBalance,
            poolAddress,
          };
        })
      );
    }
  }, [poolStatuses, poolData, poolAddresses, artists.length]);

  if (loading || contractLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeroSection />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-600">
                {loading ? 'Loading your followed artists from Spotify...' : 'Checking pool statuses...'}
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
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Following Artists</h2>
          <p className="text-lg text-gray-600">Discover and fund your favorite artists</p>
        </div>
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
