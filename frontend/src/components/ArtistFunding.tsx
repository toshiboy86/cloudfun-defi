import { FundingOverviewCards } from './FundingOverviewCards';

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
  fundAmount: string;
  onFundAmountChange: (amount: string) => void;
  onFundArtist: () => void;
  poolData?: PoolData | null;
}

export function ArtistFunding({
  artistName,
  fundAmount,
  onFundAmountChange,
  onFundArtist,
  poolData,
}: ArtistFundingProps) {
  // Use real pool data or fallback to mock data
  const fundingData = poolData ? {
    totalFunded: `$${poolData.totalUSDC}`,
    interestEarned: '$0.00', // This would need to be calculated from Aave interest
    totalFans: poolData.totalSupply, // Using total LP tokens as proxy for fans
    yourLPTokens: '0.00', // This would be user-specific
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
        totalFans={fundingData.totalFans}
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
                  <span className="font-medium">{poolData.tokenName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Token Symbol:</span>
                  <span className="font-medium">{poolData.tokenSymbol}</span>
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
              Amount (USDC)
            </label>
            <input
              type="number"
              value={fundAmount}
              onChange={(e) => onFundAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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

          <button
            onClick={onFundArtist}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Fund Artist
          </button>
        </div>
      </div>
    </div>
  );
}
