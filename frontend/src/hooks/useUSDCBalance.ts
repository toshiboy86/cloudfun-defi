import { useState, useEffect } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { useWallets } from '@privy-io/react-auth';
import { CONTRACT_ADDRESSES } from '../config/contracts';

// USDC ABI - minimal ABI for balanceOf function
const USDC_ABI = [
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

export function useUSDCBalance() {
  const [balance, setBalance] = useState<string>('0.00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { wallets } = useWallets();

  useEffect(() => {
    if (!wallets[0]?.address || !CONTRACT_ADDRESSES.USDC || CONTRACT_ADDRESSES.USDC === '0x0000000000000000000000000000000000000000') return;

    const fetchBalance = async () => {
      if (!wallets[0]?.address || !CONTRACT_ADDRESSES.USDC) {
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

        // Get the USDC balance for the user
        const balanceWei = await client.readContract({
          address: CONTRACT_ADDRESSES.USDC as `0x${string}`,
          abi: USDC_ABI,
          functionName: 'balanceOf',
          args: [wallets[0].address as `0x${string}`],
        });

        // Convert from wei to USDC (USDC has 6 decimals)
        const balanceUSDC = formatUnits(balanceWei as bigint, 6);
        
        // Format to 2 decimal places for USDC
        const formattedBalance = parseFloat(balanceUSDC).toFixed(2);
        setBalance(formattedBalance);
      } catch (err) {
        console.error('Error fetching USDC balance:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch USDC balance');
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
