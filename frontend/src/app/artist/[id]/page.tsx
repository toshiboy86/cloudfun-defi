'use client';

import { useState, use, useEffect } from 'react';
import { ArtistProfile } from '../../../components/ArtistProfile';
import { ArtistFunding } from '../../../components/ArtistFunding';
import { useFanVestFactory } from '../../../hooks/useFanVestFactory';
import { useFanVestPool } from '../../../hooks/useFanVestPool';
import { weiToUsdc } from '../../../lib/currency';

interface ArtistDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

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

interface OracleResponse {
  success: boolean;
  data?: SpotifyArtistData;
  error?: string;
  timestamp: string;
  artist_id: string;
}

interface PoolData {
  exists: boolean;
  poolAddress?: string;
  totalSupply: string;
  totalUSDC: string;
  tokenName?: string;
  tokenSymbol?: string;
}

export default function ArtistDetailPage({ params }: ArtistDetailPageProps) {
  const [fundAmount, setFundAmount] = useState('0.00');
  const [artist, setArtist] = useState<SpotifyArtistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [poolLoading, setPoolLoading] = useState(false);
  const { id } = use(params);
  
  const { hasPool, getPoolInfo, isLoading: contractLoading } = useFanVestFactory();
  const { getPoolInfo: getPoolDetails } = useFanVestPool();

  // Function to fetch pool data for the artist
  const fetchPoolData = async (artistId: string) => {
    try {
      setPoolLoading(true);
      
      // Check if pool exists
      const poolExists = await hasPool(artistId);
      
      if (poolExists) {
        // Get pool info from factory
        const poolInfo = await getPoolInfo(artistId);
        
        if (poolInfo.poolAddress && poolInfo.poolAddress !== '0x0000000000000000000000000000000000000000') {
          // Get detailed pool data from pool contract
          const poolDetails = await getPoolDetails(poolInfo.poolAddress);
          
          // Convert bigint values to formatted strings
          const totalSupply = weiToUsdc(poolDetails.totalSupplyAmount);
          const totalUSDC = weiToUsdc(poolDetails.totalUSDCAmount);
          
          setPoolData({
            exists: true,
            poolAddress: poolInfo.poolAddress,
            totalSupply: totalSupply.toFixed(2),
            totalUSDC: totalUSDC.toFixed(2),
            tokenName: poolDetails.tokenName,
            tokenSymbol: poolDetails.tokenSymbol,
          });
        } else {
          setPoolData({
            exists: false,
            totalSupply: '0.00',
            totalUSDC: '0.00',
          });
        }
      } else {
        setPoolData({
          exists: false,
          totalSupply: '0.00',
          totalUSDC: '0.00',
        });
      }
    } catch (err) {
      console.error('Error fetching pool data:', err);
      setPoolData({
        exists: false,
        totalSupply: '0.00',
        totalUSDC: '0.00',
      });
    } finally {
      setPoolLoading(false);
    }
  };

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/spotify/oracle?artist_id=${id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch artist data');
        }

        const oracleData: OracleResponse = await response.json();

        if (!oracleData.success || !oracleData.data) {
          throw new Error('No artist data received');
        }

        setArtist(oracleData.data);
        
        // Fetch pool data after getting artist data
        await fetchPoolData(id);
      } catch (err) {
        console.error('Error fetching artist data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load artist data'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArtistData();
    }
  }, [id]);

  const handleFundArtist = () => {
    if (!artist) return;

    if (parseFloat(fundAmount) > 0) {
      alert(`Funding ${artist.name} with $${fundAmount} USDC!`);
      // In a real app, this would trigger the actual funding transaction
    } else {
      alert('Please enter a valid amount to fund');
    }
  };

  const handleFundAmountChange = (amount: string) => {
    setFundAmount(amount);
  };

  if (loading || poolLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-600">
                {loading ? 'Loading artist data...' : 'Loading pool data...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
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
                Failed to load artist
              </h3>
              <p className="text-gray-600 mb-4">
                {error || 'Artist not found'}
              </p>
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
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Artist Profile */}
          <ArtistProfile artist={artist} />

          {/* Right Column - Funding Section */}
          <ArtistFunding
            artistName={artist.name}
            fundAmount={fundAmount}
            onFundAmountChange={handleFundAmountChange}
            onFundArtist={handleFundArtist}
            poolData={poolData}
          />
        </div>
      </div>
    </div>
  );
}
