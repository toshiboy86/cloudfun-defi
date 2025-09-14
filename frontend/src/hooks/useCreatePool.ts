import { useState } from 'react';
import { useSendTransaction, useWallets } from '@privy-io/react-auth';
import { encodeFunctionData } from 'viem';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import FanVestFactoryABI from '../artifacts/FanVestFactory.sol/FanVestFactory.json';

interface CreatePoolParams {
  artistId: string;
  artistName: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useCreatePool() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sendTransaction } = useSendTransaction();
  const { wallets } = useWallets();

  const createPool = async ({ artistId, artistName, onSuccess, onError }: CreatePoolParams) => {
    if (!wallets[0]) {
      const errorMsg = 'No wallet connected';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      // Generate token name and symbol based on artist name
      const tokenName = `${artistName} Fan LP`;
      const tokenSymbol = `${artistName.substring(0, 3).toUpperCase()}FAN`;
      // Create pool transaction
      console.log([artistId, tokenName, tokenSymbol, CONTRACT_ADDRESSES.ADMIN_ADDRESS as `0x${string}`])
      const result = await sendTransaction({
        to: CONTRACT_ADDRESSES.FANVEST_FACTORY as `0x${string}`,
        data: encodeFunctionData({
          abi: FanVestFactoryABI.abi,
          functionName: 'createPool',
          args: [artistId, tokenName, tokenSymbol, CONTRACT_ADDRESSES.ADMIN_ADDRESS as `0x${string}`],
        }),
        gasLimit: 5000000n, // Set a reasonable gas limit for createPool
      });

      console.log('Pool creation transaction hash:', result);
      
      onSuccess?.();
      return result;
    } catch (err) {
      console.error('Pool creation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Pool creation failed';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createPool,
    isCreating,
    error,
    clearError: () => setError(null),
  };
}
