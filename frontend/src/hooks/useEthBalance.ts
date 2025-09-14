import { useState, useEffect } from 'react';
import { createPublicClient, http, formatEther } from 'viem';
import { sepolia } from 'viem/chains';
import { useWallets, usePrivy } from '@privy-io/react-auth';

export function useEthBalance() {
  const [balance, setBalance] = useState<string>('0.00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { wallets } = useWallets();

  useEffect(() => {
    if (!wallets[0]?.address) return;
    const fetchBalance = async () => {

      if (!wallets[0]?.address) {
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
        // Get the balance
        const balanceWei = await client.getBalance({
          address: wallets[0].address as `0x${string}`,
        });
        

        // Convert from wei to ETH
        const balanceEth = formatEther(balanceWei);
        
        // Format to 4 decimal places
        const formattedBalance = parseFloat(balanceEth).toFixed(4);
        setBalance(formattedBalance);
      } catch (err) {
        console.error('Error fetching ETH balance:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch balance');
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
