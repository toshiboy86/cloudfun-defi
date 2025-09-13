import { ClaimOverviewCards } from './ClaimOverviewCards';

interface ArtistClaimProps {
  artistName: string;
  claimAmount: string;
  onClaimAmountChange: (amount: string) => void;
  onClaimFunds: () => void;
}

export function ArtistClaim({
  artistName,
  claimAmount,
  onClaimAmountChange,
  onClaimFunds,
}: ArtistClaimProps) {
  // Mock claim data - in a real app, this would come from your smart contracts
  const mockClaimData = {
    availableToClaim: '$12,450.75',
    interestEarned: '$8,230.25',
    fundingFans: '89',
    yourClaimTokens: '89.25',
  };

  return (
    <div className="space-y-8">
      <ClaimOverviewCards
        availableToClaim={mockClaimData.availableToClaim}
        interestEarned={mockClaimData.interestEarned}
        fundingFans={mockClaimData.fundingFans}
        yourClaimTokens={mockClaimData.yourClaimTokens}
      />

      {/* Claim Funds Section */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            💰 Claim Your Funds
          </h2>
          <div className="bg-emerald-100 px-4 py-2 rounded-full">
            <span className="text-emerald-800 font-medium text-sm">
              {mockClaimData.availableToClaim} Available
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
            <h3 className="font-medium text-emerald-900 mb-3">
              Claim Process (Fan-Collected Funds):
            </h3>
            <ul className="space-y-2 text-sm text-emerald-800">
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Withdraw fan contributions from Aave lending pool</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Convert LP tokens back to USDC</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Transfer to your wallet</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Earned interest from fan investments included</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-medium text-gray-900 mb-3">Claim Summary:</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-emerald-900">
                    Available to Claim:
                  </span>
                  <span className="font-bold text-emerald-900 text-lg">
                    {mockClaimData.availableToClaim}
                  </span>
                </div>
                <p className="text-xs text-emerald-700 mt-1">
                  Collected by your fans - ready for immediate withdrawal
                </p>
              </div>

              <div className="flex justify-between">
                <span>Claiming Amount:</span>
                <span className="font-medium">${claimAmount || '0.00'}</span>
              </div>

              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Remaining Balance:</span>
                <span className="font-medium">
                  $
                  {(
                    parseFloat(
                      mockClaimData.availableToClaim
                        .replace('$', '')
                        .replace(',', '')
                    ) - parseFloat(claimAmount || '0')
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClaimFunds}
            disabled={!claimAmount || parseFloat(claimAmount) <= 0}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
          >
            Claim Funds
          </button>
        </div>
      </div>
    </div>
  );
}
