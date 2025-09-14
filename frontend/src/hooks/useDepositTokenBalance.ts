import { useState, useEffect } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { useWallets } from '@privy-io/react-auth';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import { weiToUsdc } from '@/lib/currency';

// aUSDC ABI - minimal ABI for balanceOf function
const AAVE_TOKEN_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export function useDepositTokenBalance() {
  const [balance, setBalance] = useState<string>('0.00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { wallets } = useWallets();

  useEffect(() => {
    if (!wallets[0]?.address || !CONTRACT_ADDRESSES.DEPOSIT_TOKEN || CONTRACT_ADDRESSES.DEPOSIT_TOKEN === '0x0000000000000000000000000000000000000000') return;

    const fetchBalance = async () => {
      if (!wallets[0]?.address || !CONTRACT_ADDRESSES.DEPOSIT_TOKEN) {
        setBalance('0.00');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Create a public client for Sepolia
        const client = createPublicClient({
          chain: sepolia,
          transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org'),
        });

        // Get the aUSDC balance for the user
        const balanceWei = await client.readContract({
          address: CONTRACT_ADDRESSES.DEPOSIT_TOKEN as `0x${string}`,
          abi: AAVE_TOKEN_ABI,
          functionName: 'balanceOf',
          args: [wallets[0].address as `0x${string}`],
        });
        

        // Convert from wei to aUSDC (aUSDC has 6 decimals like USDC)
        const balanceAUSDC = weiToUsdc(balanceWei as bigint);
        
        // Format to 2 decimal places for aUSDC
        const formattedBalance = balanceAUSDC.toFixed(2);
        setBalance(formattedBalance);
      } catch (err) {
        console.error('Error fetching aUSDC balance:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch aUSDC balance');
        setBalance('0.00');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();

    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000);

    return () => clearInterval(interval);
  }, [wallets]);

  return {
    balance,
    loading,
    error,
  };
}
