'use client';

import { HeroSection } from '../../components/HeroSection';
import { ArtistCard } from '../../components/ArtistCard';
import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
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

// Memoized ArtistCard to prevent unnecessary re-renders
const MemoizedArtistCard = memo(ArtistCard);

export default function ListPage() {
  const [artists, setArtists] = useState<ArtistWithFunding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [poolStatuses, setPoolStatuses] = useState<Record<string, 'active' | 'no-pool'>>({});
  const [poolAddresses, setPoolAddresses] = useState<Record<string, string>>({});
  const [poolData, setPoolData] = useState<Record<string, { lpTokens: string; lpBalance: string }>>({});
  const [isCheckingPools, setIsCheckingPools] = useState(false);
  const hasFetchedData = useRef(false);
  const hasCheckedPools = useRef(false);
  const lastArtistIds = useRef<string[]>([]);
  const { accessToken, isConnected } = useSpotify();
  const { hasPool, getPoolInfo, isLoading: contractLoading } = useFanVestFactory();
  const { getPoolInfo: getPoolDetails } = useFanVestPool();


  // Function to create initial artist data (without pool information)
  const createInitialArtistData = useCallback((spotifyData: SpotifyArtistData[]): ArtistWithFunding[] => {
    return spotifyData.map((data) => ({
      id: data.id,
      name: data.name,
      status: 'no-pool' as const,
      genre: data.genres[0] || 'Unknown',
      followers: data.followers.total.toLocaleString(),
      popularity: data.popularity,
      lpTokens: '0.00',
      lpBalance: '$0.00',
      buttonText: 'Fund Artist',
      imageUrl: data.images[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image',
      poolAddress: undefined,
    }));
  }, []);

  // Main effect to fetch Spotify data
  useEffect(() => {
    const fetchFollowedArtists = async () => {
      if (!isConnected || !accessToken || hasFetchedData.current) {
        if (!isConnected || !accessToken) {
          setError('Please connect your Spotify account first');
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        hasFetchedData.current = true;

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

        const followedArtistsData: FollowedArtistsResponse = await response.json();

        if (!followedArtistsData.success || !followedArtistsData.data) {
          throw new Error('No followed artists data received');
        }

        // Check if this is fallback data
        setIsFallback(followedArtistsData.fallback || false);

        // Create initial artist data with default pool info
        const artistData = createInitialArtistData(followedArtistsData.data);

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
        hasFetchedData.current = false; // Reset on error to allow retry
      } finally {
        setLoading(false);
      }
    };

    fetchFollowedArtists();
  }, [accessToken, isConnected, createInitialArtistData]);

  // Reset fetch flag when access token changes
  useEffect(() => {
    hasFetchedData.current = false;
    hasCheckedPools.current = false;
    lastArtistIds.current = [];
  }, [accessToken]);

  // Check pool statuses when artists are loaded
  useEffect(() => {
    if (artists.length > 0 && !isCheckingPools && !hasCheckedPools.current) {
      const artistIds = artists.map(artist => artist.id);
      
      // Check if we've already processed these exact artist IDs
      const artistIdsChanged = JSON.stringify(artistIds) !== JSON.stringify(lastArtistIds.current);
      
      if (artistIdsChanged) {
        lastArtistIds.current = artistIds;
        hasCheckedPools.current = true;
        
        // Call the pool checking logic directly to avoid dependency issues
        const checkPools = async () => {
          if (artistIds.length === 0) return;
          
          setIsCheckingPools(true);
          const statuses: Record<string, 'active' | 'no-pool'> = {};
          const addresses: Record<string, string> = {};
          const poolInfo: Record<string, { lpTokens: string; lpBalance: string }> = {};
          
          // Process artists in batches to avoid overwhelming the RPC
          const batchSize = 5;
          for (let i = 0; i < artistIds.length; i += batchSize) {
            const batch = artistIds.slice(i, i + batchSize);
            
            // Process batch in parallel
            await Promise.allSettled(
              batch.map(async (artistId) => {
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
              })
            );
          }
          
          setPoolStatuses(statuses);
          setPoolAddresses(addresses);
          setPoolData(poolInfo);
          setIsCheckingPools(false);
        };
        
        checkPools();
      }
    }
  }, [artists.length, isCheckingPools]);

  // Update artists when pool data changes (without causing infinite loops)
  useEffect(() => {
    if (artists.length > 0 && Object.keys(poolStatuses).length > 0) {
      const updatedArtists = artists.map(artist => {
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
      });
      
      // Only update if there are actual changes
      const hasChanges = updatedArtists.some((updated, index) => {
        const original = artists[index];
        return (
          updated.status !== original.status ||
          updated.lpTokens !== original.lpTokens ||
          updated.lpBalance !== original.lpBalance ||
          updated.poolAddress !== original.poolAddress
        );
      });
      
      if (hasChanges) {
        setArtists(updatedArtists);
      }
    }
  }, [poolStatuses, poolData, poolAddresses]); // Removed artists.length from dependencies

  // Memoize the artists array to prevent unnecessary re-renders
  const memoizedArtists = useMemo(() => artists, [artists]);

  if (loading || contractLoading || isCheckingPools) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeroSection />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-600">
                {loading 
                  ? 'Loading your followed artists from Spotify...' 
                  : isCheckingPools 
                    ? 'Checking pool statuses...' 
                    : 'Loading...'
                }
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
          {memoizedArtists.map((artist) => (
            <MemoizedArtistCard
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
