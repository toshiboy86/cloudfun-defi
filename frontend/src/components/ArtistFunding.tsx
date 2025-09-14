import { FundingOverviewCards } from './FundingOverviewCards';
import { useCreatePool } from '../hooks/useCreatePool';
import { useLPTokenBalance } from '@/hooks/useLPTokenBalance';
import { weiToUsdc } from '@/lib/currency';

interface PoolData {
  exists: boolean;
  poolAddress?: string;
  totalSupply: string;
  totalUSDC: string;
  tokenName?: string;
  tokenSymbol?: string;
}

interface ArtistFundingProps {
  artistName: string;
  artistId: string;
  fundAmount: string;
  onFundAmountChange: (amount: string) => void;
  onFundArtist: () => void;
  poolData?: PoolData | null;
  isFunding?: boolean;
  fundingError?: string | null;
  isAuthenticated?: boolean;
  onLogin?: () => void;
  onPoolCreated?: () => void;
}

export function ArtistFunding({
  artistName,
  artistId,
  fundAmount,
  onFundAmountChange,
  onFundArtist,
  poolData,
  isFunding = false,
  fundingError,
  isAuthenticated = false,
  onLogin,
  onPoolCreated,
}: ArtistFundingProps) {
  const { createPool, isCreating, error: poolCreationError, clearError } = useCreatePool();
  const { balance: lpBalance, loading: lpLoading } = useLPTokenBalance(poolData?.poolAddress);


  const handleCreatePool = async () => {
    try {
      await createPool({
        artistId,
        artistName,
        onSuccess: () => {
          console.log('Pool created successfully!');
          onPoolCreated?.();
        },
        onError: (error) => {
          console.error('Pool creation failed:', error);
        },
      });
    } catch (error) {
      console.error('Pool creation error:', error);
    }
  };
  // Use real pool data or fallback to mock data
  const fundingData = poolData ? {
    totalFunded: `$${poolData.totalUSDC}`,
    interestEarned: `$${poolData.totalUSDC}`, // This would need to be calculated from Aave interest
    yourLPTokens: lpBalance, // This would be user-specific
  } : {
    totalFunded: '$0.00',
    interestEarned: '$0.00',
    totalFans: '0',
    yourLPTokens: '0.00',
  };

  return (
    <div className="space-y-8">
      <FundingOverviewCards
        totalFunded={fundingData.totalFunded}
        interestEarned={fundingData.interestEarned}
        yourLPTokens={fundingData.yourLPTokens}
      />

      {/* Pool Status Section */}
      {poolData && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pool Status
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Pool Exists:</span>
              <span className={`font-medium ${poolData.exists ? 'text-green-600' : 'text-red-600'}`}>
                {poolData.exists ? 'Yes' : 'No'}
              </span>
            </div>
            {poolData.exists && poolData.tokenName && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Token Name:</span>
                  <span className="text-gray-600 font-medium">{poolData.tokenName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Token Symbol:</span>
                  <span className="text-gray-600 font-medium">{poolData.tokenSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pool Address:</span>
                  <span className="font-mono text-sm text-blue-600">
                    {poolData.poolAddress?.slice(0, 6)}...{poolData.poolAddress?.slice(-4)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Fund This Artist Section */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {poolData?.exists ? '$ Fund This Artist' : '$ Create Pool & Fund Artist'}
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (AAVE)
            </label>
            <input
              type="number"
              value={fundAmount}
              onChange={(e) => onFundAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-medium text-gray-900 mb-3">
              Your funds will be:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Deposited into Aave to earn interest</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Available for the artist to claim</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Converted to LP tokens representing your share</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Eligible for future streaming royalties</span>
              </li>
            </ul>
          </div>

          {/* Error Display */}
          {(fundingError || poolCreationError) && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="text-sm">
                {fundingError ? `Transaction failed: ${fundingError}` : `Pool creation failed: ${poolCreationError}`}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!isAuthenticated ? (
            <button
              onClick={onLogin}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Connect Wallet to Fund
            </button>
          ) : !poolData?.exists ? (
            <div className="space-y-3">
              {/* Create Pool Button */}
              <button
                onClick={handleCreatePool}
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Pool...
                  </div>
                ) : (
                  'Create Pool for Artist'
                )}
              </button>
              
              {/* Fund Button (disabled when no pool) */}
              <button
                onClick={onFundArtist}
                disabled={true}
                className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg cursor-not-allowed opacity-50"
              >
                Fund Artist (Pool Required)
              </button>
            </div>
          ) : (
            <button
              onClick={onFundArtist}
              disabled={isFunding}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFunding ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Transaction...
                </div>
              ) : (
                'Fund Artist'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
