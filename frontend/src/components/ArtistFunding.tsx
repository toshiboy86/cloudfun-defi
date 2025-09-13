import { FundingOverviewCards } from './FundingOverviewCards';

interface ArtistFundingProps {
  artistName: string;
  fundAmount: string;
  onFundAmountChange: (amount: string) => void;
  onFundArtist: () => void;
}

export function ArtistFunding({
  artistName,
  fundAmount,
  onFundAmountChange,
  onFundArtist,
}: ArtistFundingProps) {
  // Mock funding data - in a real app, this would come from your smart contracts
  const mockFundingData = {
    totalFunded: '$45,780.5',
    interestEarned: '$2,340.25',
    totalFans: '127',
    yourLPTokens: '127.50',
  };

  return (
    <div className="space-y-8">
      <FundingOverviewCards
        totalFunded={mockFundingData.totalFunded}
        interestEarned={mockFundingData.interestEarned}
        totalFans={mockFundingData.totalFans}
        yourLPTokens={mockFundingData.yourLPTokens}
      />

      {/* Fund This Artist Section */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          $ Fund This Artist
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
