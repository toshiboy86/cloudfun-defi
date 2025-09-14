import { useState, useEffect } from 'react';
import { useFanVestPool } from '@/hooks/useFanVestPool';
import { ClaimOverviewCards } from './ClaimOverviewCards';
import { weiToUsdc } from '@/lib/currency';
import { executeClaimTransaction } from '@/lib/transactions';
import { useSendTransaction } from '@privy-io/react-auth';

interface ArtistClaimProps {
  artistName: string;
  claimAmount: string;
  onClaimAmountChange: (amount: string) => void;
  onClaimFunds: () => void;
  poolAddress?: string;
}

export function ArtistClaim({
  artistName,
  claimAmount,
  onClaimAmountChange,
  onClaimFunds,
  poolAddress,
}: ArtistClaimProps) {
  const { getPoolInfo, isLoading, error } = useFanVestPool(poolAddress);
  const [poolInfo, setPoolInfo] = useState<any>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const { sendTransaction } = useSendTransaction();

  useEffect(() => {
    const fetchPoolInfo = async () => {
      if (poolAddress) {
        try {
          const info = await getPoolInfo();
          setPoolInfo(info);
        } catch (err) {
          console.error('Error fetching pool info:', err);
        }
      }
    };

    fetchPoolInfo();
  }, [poolAddress, getPoolInfo]);

  const handleClaim = async () => {
    if (!poolAddress) {
      setClaimError('Pool address is required');
      return;
    }

    setIsClaiming(true);
    setClaimError(null);
    setClaimSuccess(null);

    try {
      const result = await executeClaimTransaction({
        poolAddress,
        sendTransaction,
      });

      setClaimSuccess(`Successfully claimed funds! Transaction: ${result.claimTx}`);
      console.log('Claim transaction completed:', result);
      
      // Refresh pool info after successful claim
      const info = await getPoolInfo();
      setPoolInfo(info);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to claim funds';
      setClaimError(errorMessage);
      console.error('Claim error:', err);
    } finally {
      setIsClaiming(false);
    }
  };

  // Mock claim data - in a real app, this would come from your smart contracts
  const data = {
    availableToClaim: `$${weiToUsdc(poolInfo?.totalUSDCAmount || '0')}`,
    interestEarned: `$${poolInfo?.earnedInterest || '0'}`,
    yourClaimTokens: poolInfo?.totalSupplyAmount || 0,
  };

  return (
    <div className="space-y-8">
      <ClaimOverviewCards
        availableToClaim={data.availableToClaim}
        interestEarned={data.interestEarned}
        yourClaimTokens={data.yourClaimTokens}
      />

      {/* Claim Funds Section */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            💰 Claim Your Funds
          </h2>
          <div className="bg-emerald-100 px-4 py-2 rounded-full">
            <span className="text-emerald-800 font-medium text-sm">
              {data.availableToClaim} Available
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
                    {data.availableToClaim}
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
                      data.availableToClaim
                        .replace('$', '')
                        .replace(',', '')
                    ) - parseFloat(claimAmount || '0')
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {claimError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-red-800 text-sm font-medium">{claimError}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {claimSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-green-800 text-sm font-medium">{claimSuccess}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleClaim}
            disabled={isClaiming || !poolAddress || (poolInfo?.totalUSDCAmount || 0) <= 0}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
          >
            {isClaiming ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Claiming Funds...
              </div>
            ) : (
              'Claim Funds'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
