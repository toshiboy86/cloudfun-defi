import { useState, useEffect } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { useWallets } from '@privy-io/react-auth';
import FanVestPoolABI from '../artifacts/FanVestPool.sol/FanVestPool.json';
import { RPC_URLS } from '../config/contracts';

export function useLPTokenBalance(poolAddress?: string) {
  const [balance, setBalance] = useState<string>('0.00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { wallets } = useWallets();

  useEffect(() => {
    if (!wallets[0]?.address || !poolAddress) return;

    const fetchBalance = async () => {
      if (!wallets[0]?.address || !poolAddress) {
        setBalance('0.00');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Create a public client for Sepolia
        const client = createPublicClient({
          chain: sepolia,
          transport: http(RPC_URLS.SEPOLIA),
        });
        // Get the LP token balance for the user
        const balanceWei = await client.readContract({
          address: poolAddress as `0x${string}`,
          abi: FanVestPoolABI.abi,
          functionName: 'balanceOf',
          args: [wallets[0].address as `0x${string}`],
        });

        // Convert from wei to tokens (assuming 18 decimals)
        const balanceTokens = formatUnits(balanceWei as bigint, 18);
        
        // Format to 4 decimal places
        const formattedBalance = parseFloat(balanceTokens).toFixed(4);
        setBalance(formattedBalance);
      } catch (err) {
        console.error('Error fetching LP token balance:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch LP token balance');
        setBalance('0.00');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();

    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000);

    return () => clearInterval(interval);
  }, [wallets, poolAddress]);

  return {
    balance,
    loading,
    error,
  };
}
